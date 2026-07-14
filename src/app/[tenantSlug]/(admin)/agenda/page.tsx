"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { useTenantAppointments, useTenantEmployees, useTenantServices, useTenantServiceCategories } from "@/hooks/useTenantRecords"
import type { AppointmentRecord, ServiceRecord } from "@/types/catalog"
import { NewAppointmentModal } from "@/components/agenda/new-appointment-modal"
import { CompleteAppointmentModal } from "@/components/agenda/complete-appointment-modal"
import { AgendaSidebar } from "@/components/agenda/agenda-sidebar"
import { AgendaHeader } from "@/components/agenda/agenda-header"
import { AgendaGrid } from "@/components/agenda/agenda-grid"
import { EmployeeCarousel } from "@/components/agenda/employee-carousel"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { AgendaFilters } from "@/types/agenda"
import { DEFAULT_FILTERS } from "@/types/agenda"

type AppointmentView = AppointmentRecord & {
    service?: ServiceRecord
    startDate: Date
    duration: number
}

export default function AgendaPage() {
    const searchParams = useSearchParams()
    const employeeFromUrl = searchParams.get('employee')
    const { currentTenant } = useTenant()

    // Estados
    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [filters, setFilters] = useState<AgendaFilters>(DEFAULT_FILTERS)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null)
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [appointmentToComplete, setAppointmentToComplete] = useState<AppointmentRecord | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedMobileEmployee, setSelectedMobileEmployee] = useState<string | null>(null)
    const [isMobileView, setIsMobileView] = useState(false)

    // Dados
    const { data: serviceRecords } = useTenantServices(currentTenant.id)
    const { data: employeeRecords } = useTenantEmployees(currentTenant.id)
    const { data: appointmentRecords, refetch: refetchAppointments } = useTenantAppointments(currentTenant.id)
    const { data: serviceCategoryRecords } = useTenantServiceCategories(currentTenant.id)

    // Mapa de serviços
    const serviceMap = useMemo(() => {
        const map = new Map<string, ServiceRecord>()
        serviceRecords.forEach(service => map.set(service.id, service))
        return map
    }, [serviceRecords])

    // Appointments enriquecidos
    const tenantAppointments = useMemo<AppointmentView[]>(() => (
        appointmentRecords.map((apt) => {
            const service = apt.serviceId ? serviceMap.get(apt.serviceId) : undefined
            const startDate = new Date(apt.startAt)
            const duration = apt.durationMinutes ?? service?.durationMinutes ?? 60
            return {
                ...apt,
                service,
                startDate,
                duration,
            }
        })
    ), [appointmentRecords, serviceMap])

    // Categorias dos serviços (dados reais do banco)
    const serviceCategories = useMemo(() => {
        return serviceCategoryRecords.map(cat => ({
            id: cat.id,
            name: cat.name,
            shortCode: cat.shortCode || cat.name.substring(0, 3).toUpperCase()
        }))
    }, [serviceCategoryRecords])

    // Detectar mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Selecionar primeiro profissional em mobile
    useEffect(() => {
        if (isMobileView && employeeRecords.length > 0 && !selectedMobileEmployee) {
            setSelectedMobileEmployee(employeeRecords[0].id)
        }
    }, [isMobileView, employeeRecords, selectedMobileEmployee])

    // Carregar preferências do localStorage
    useEffect(() => {
        setIsMounted(true)
        const savedFilters = localStorage.getItem('agenda-filters')
        const savedSidebarOpen = localStorage.getItem('agenda-sidebar-open')

        if (savedFilters) {
            try {
                setFilters(JSON.parse(savedFilters))
            } catch (e) {
                console.error('Erro ao carregar filtros salvos:', e)
            }
        }

        // Sidebar fechada por padrão em mobile
        const isMobile = window.innerWidth < 768
        if (savedSidebarOpen !== null) {
            setSidebarOpen(isMobile ? false : savedSidebarOpen === 'true')
        } else {
            setSidebarOpen(!isMobile)
        }

        // Atualizar employee selecionado via URL
        if (employeeFromUrl) {
            setFilters(prev => ({
                ...prev,
                selectedEmployees: [employeeFromUrl],
            }))
            setSelectedMobileEmployee(employeeFromUrl)
        }
    }, [employeeFromUrl])

    // Salvar preferências no localStorage
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('agenda-filters', JSON.stringify(filters))
            localStorage.setItem('agenda-sidebar-open', sidebarOpen.toString())
        }
    }, [filters, sidebarOpen, isMounted])

    // Filtrar profissionais
    const filteredEmployees = useMemo(() => {
        // Em mobile, mostrar apenas o profissional selecionado no carrossel
        if (isMobileView && selectedMobileEmployee) {
            const employee = employeeRecords.find(e => e.id === selectedMobileEmployee)
            return employee ? [employee] : []
        }

        // Desktop: usar filtros normais
        if (filters.selectedEmployees.includes('all')) {
            return employeeRecords
        }
        return employeeRecords.filter(e => filters.selectedEmployees.includes(e.id))
    }, [employeeRecords, filters.selectedEmployees, isMobileView, selectedMobileEmployee])

    // Filtrar appointments
    const filteredAppointments = useMemo(() => {
        return tenantAppointments.filter(apt => {
            // Filtrar por profissional
            if (!filters.selectedEmployees.includes('all') &&
                !filters.selectedEmployees.includes(apt.employeeId ?? '')) {
                return false
            }

            // Filtrar por status
            if (filters.selectedStatuses.length > 0 &&
                !filters.selectedStatuses.includes(apt.status)) {
                return false
            }

            // Filtrar por categoria de serviço
            if (!filters.selectedServiceCategories.includes('all')) {
                const service = serviceMap.get(apt.serviceId ?? '')
                if (filters.selectedServiceCategories.length > 0 &&
                    !filters.selectedServiceCategories.includes(service?.categoryId ?? '')) {
                    return false
                }
            }

            // Filtrar ausências de profissional
            if (!filters.showAbsences && apt.status === 'staff_unavailable') {
                return false
            }

            // Filtrar por busca de cliente
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const customerName = (apt.customerName || '').toLowerCase()
                if (!customerName.includes(query)) {
                    return false
                }
            }

            return true
        })
    }, [tenantAppointments, filters, serviceMap, searchQuery])

    // Atualizar status do appointment
    const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
        if (isSupabaseConfigured) {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) return

            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', appointmentId)

            if (error) {
                console.error("[AgendaPage] Erro ao atualizar status do agendamento:", error.message)
                return
            }
        }
        refetchAppointments()
    }

    const handleAppointmentClick = (appointment: AppointmentView) => {
        setSelectedAppointment(appointment)
        setIsNewAppointmentModalOpen(true)
    }

    if (!isMounted) {
        return (
            <div className="h-screen w-full flex items-center justify-center text-muted-foreground">
                Carregando agenda...
            </div>
        )
    }

    return (
        <>
            {/* Modais */}
            <NewAppointmentModal
                isOpen={isNewAppointmentModalOpen}
                onClose={() => {
                    setIsNewAppointmentModalOpen(false)
                    setSelectedAppointment(null)
                }}
                onSuccess={() => {
                    setIsNewAppointmentModalOpen(false)
                    setSelectedAppointment(null)
                    refetchAppointments()
                }}
                tenantId={currentTenant.id}
                appointment={selectedAppointment}
            />
            <CompleteAppointmentModal
                open={showCompleteModal}
                onOpenChange={setShowCompleteModal}
                appointment={appointmentToComplete}
                onSuccess={() => {
                    setAppointmentToComplete(null)
                    refetchAppointments()
                }}
            />

            {/* Layout Principal */}
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar recolhível - Escondida em mobile */}
                <AgendaSidebar
                    isOpen={sidebarOpen && !isMobileView}
                    filters={filters}
                    onFiltersChange={setFilters}
                    employees={employeeRecords}
                    serviceCategories={serviceCategories}
                    onNewAppointment={() => {
                        setSelectedAppointment(null)
                        setIsNewAppointmentModalOpen(true)
                    }}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                />

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Carrossel de profissionais - Apenas mobile */}
                    {isMobileView && (
                        <EmployeeCarousel
                            employees={employeeRecords}
                            selectedEmployeeId={selectedMobileEmployee}
                            onSelectEmployee={setSelectedMobileEmployee}
                        />
                    )}

                    <AgendaHeader
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        onNewAppointment={() => {
                            setSelectedAppointment(null)
                            setIsNewAppointmentModalOpen(true)
                        }}
                        sidebarOpen={sidebarOpen}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        totalAppointments={tenantAppointments.length}
                        filteredCount={filteredAppointments.length}
                    />

                    <AgendaGrid
                        employees={filteredEmployees}
                        appointments={filteredAppointments}
                        currentDate={currentDate}
                        gridSize={filters.gridSize}
                        searchQuery={searchQuery}
                        onAppointmentClick={handleAppointmentClick}
                        onUpdateStatus={updateAppointmentStatus}
                        isMobileView={isMobileView}
                    />
                </div>
            </div>
        </>
    )
}
