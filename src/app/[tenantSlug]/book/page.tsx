"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, isSameDay, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ArrowRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    MapPin,
    Phone,
    ShieldCheck,
    ShoppingBag,
    Smartphone,
    Sparkles,
    Star,
    Gift,
    MessageCircle,
    User,
    Users as UsersIcon,
    Wallet,
    Quote,
    Crown,
    Trophy,
    Instagram
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import bcrypt from "bcryptjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { cn, getInitials, hexToHsl } from "@/lib/utils"
import { CustomerTrustBar } from "@/components/CustomerTrustBar"
import { CustomerReviews } from "@/components/CustomerReviews"
import { galleryImages as fallbackGallery, highlights as fallbackHighlights, testimonials as fallbackTestimonials } from "@/mocks/marketing"
import {
    useTenantAppointments,
    useTenantBySlug,
    useTenantCombos,
    useTenantCustomers,
    useTenantEmployees,
    useTenantServices,

    useTenantStaffAvailability,
    useTenantGallery,
    useTenantHighlights,
    useTenantTestimonials
} from "@/hooks/useTenantRecords"
import type { ComboRecord, EmployeeRecord, ServiceRecord, StaffAvailabilityRecord } from "@/types/catalog"
import type { ClientRecord } from "@/types/crm"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

type Step = 'service' | 'professional' | 'datetime' | 'client_info' | 'confirmation' | 'payment' | 'success'

const STEP_SEQUENCE: Step[] = ['service', 'professional', 'datetime', 'client_info', 'confirmation', 'payment']
const SUCCESS_STEP: Step = 'success'

const STEP_DETAILS: Record<Step, { label: string; description: string; icon: LucideIcon }> = {
    service: { label: "Serviço", description: "Escolha o cuidado", icon: Sparkles },
    professional: { label: "Profissional", description: "Preferências", icon: UsersIcon },
    datetime: { label: "Data & hora", description: "Disponibilidade", icon: Clock },
    client_info: { label: "Seus dados", description: "Identifique-se", icon: ShieldCheck },
    confirmation: { label: "Confirmação", description: "Revise tudo", icon: CheckCircle2 },
    payment: { label: "Pagamento", description: "Finalize em segurança", icon: CreditCard },
    success: { label: "Concluído", description: "Tudo pronto", icon: CheckCircle2 },
}

const weekDayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

type PaymentMethod = {
    id: 'pix' | 'card' | 'local'
    label: string
    icon: LucideIcon
    description: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'pix', label: 'Pix (5% de Desconto)', icon: Smartphone, description: 'Liberação imediata' },
    { id: 'card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Até 3x sem juros' },
    { id: 'local', label: 'Pagar no Local', icon: Wallet, description: 'Pague ao finalizar o serviço' },
]

type EmployeeSchedule = Record<typeof weekDayKeys[number], { start: string; end: string }[]>

type EmployeeWithSchedule = EmployeeRecord & {
    name: string
    workingHours: EmployeeSchedule
    specialties: string[]
}

const trustHighlights = [
    { title: "Padrão BeautyFlow", description: "Equipe selecionada, avaliação 4.9/5", icon: Star },
    { title: "Confirmação imediata", description: "Whatsapp + e-mail com todos os detalhes", icon: MessageCircle },
    { title: "Presentes especiais", description: "Cupons exclusivos após o agendamento", icon: Gift },
]

const normalizeCpf = (value: string) => value.replace(/\D/g, "")

const formatSlotTime = (value: string | null | undefined) => {
    if (!value) return ""
    return value.slice(0, 5)
}

const formatCpfDisplay = (value: string) => {
    const digits = normalizeCpf(value)
    if (digits.length !== 11) return value
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

const getServiceBuffer = (service: ServiceRecord | null, key: "bufferBefore" | "bufferAfter") => {
    if (!service?.metadata) return 0
    const rawValue = service.metadata[key as keyof typeof service.metadata]
    if (typeof rawValue === "number") return rawValue
    if (typeof rawValue === "string") {
        const parsed = Number(rawValue)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

const createEmptySchedule = (): EmployeeSchedule => {
    return weekDayKeys.reduce((acc, day) => {
        acc[day] = []
        return acc
    }, {} as EmployeeSchedule)
}

const buildScheduleFromSlots = (slots: StaffAvailabilityRecord[]): EmployeeSchedule => {
    const schedule = createEmptySchedule()

    slots.forEach(slot => {
        const key = weekDayKeys[slot.weekday]
        if (!key) return
        schedule[key].push({
            start: formatSlotTime(slot.startTime),
            end: formatSlotTime(slot.endTime),
        })
    })

    const hasAvailability = Object.values(schedule).some(day => day.length > 0)

    if (!hasAvailability) {
        ;["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
            const typedDay = day as typeof weekDayKeys[number]
            schedule[typedDay].push({ start: "09:00", end: "18:00" })
        })
    }

    return schedule
}

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const { data: tenant, loading: tenantLoading } = useTenantBySlug(tenantSlug)
    const tenantId = tenant?.id

    const { data: serviceRecords, loading: servicesLoading } = useTenantServices(tenantId)
    const { data: employeeRecords, loading: employeesLoading } = useTenantEmployees(tenantId)
    const { data: appointmentRecords, loading: appointmentsLoading } = useTenantAppointments(tenantId)
    const { data: customerRecords, loading: customersLoading } = useTenantCustomers(tenantId)
    const { data: comboRecords, loading: combosLoading } = useTenantCombos(tenantId)

    const { data: availabilityRecords, loading: availabilityLoading } = useTenantStaffAvailability(tenantId)
    // Marketing Hooks
    const { data: galleryData, loading: galleryLoading } = useTenantGallery(tenantId)
    const { data: highlightData, loading: highlightsLoading } = useTenantHighlights(tenantId)
    const { data: testimonialData, loading: testimonialsLoading } = useTenantTestimonials(tenantId)

    const supabase = getSupabaseBrowserClient()
    const supabaseReady = Boolean(isSupabaseConfigured && supabase && tenantId)
    const isLoadingData = tenantLoading || servicesLoading || employeesLoading || appointmentsLoading || customersLoading || combosLoading || availabilityLoading

    const tenantInitials = useMemo(() => getInitials(tenant?.fullName || tenant?.name || ""), [tenant?.fullName, tenant?.name])
    const tenantBadge = tenant?.logo || tenantInitials || "BF"
    // Convert tenant hex to HSL for dynamic branding
    const primaryHsl = useMemo(() => {
        if (!tenant?.primaryColor) return null
        // Assuming hexToHsl is imported from "@/lib/utils"
        // If not, we fall back to global default
        return hexToHsl(tenant.primaryColor)
    }, [tenant?.primaryColor])

    // Style object for dynamic theme
    const themeStyle = useMemo(() => {
        if (!primaryHsl) return undefined
        return {
            "--primary": primaryHsl,
            "--ring": primaryHsl,
        } as React.CSSProperties
    }, [primaryHsl])

    // Marketing Data (with Fallback to mocks if Real DB is empty/loading, or strict override)
    const tenantHighlights = useMemo(() => {
        if (highlightData && highlightData.length > 0) return highlightData
        if (!tenant?.id) return []
        // Fallback to mocks only if tenant ID matches mock ID for demo purposes
        return fallbackHighlights.filter(h => h.tenantId === tenant.id)
    }, [highlightData, tenant?.id])

    const tenantGallery = useMemo(() => {
        if (galleryData && galleryData.length > 0) return galleryData
        if (!tenant?.id) return []
        return fallbackGallery.filter(g => g.tenantId === tenant.id).sort((a, b) => a.displayOrder - b.displayOrder)
    }, [galleryData, tenant?.id])

    const tenantTestimonials = useMemo(() => {
        if (testimonialData && testimonialData.length > 0) return testimonialData
        if (!tenant?.id) return []
        return fallbackTestimonials.filter(t => t.tenantId === tenant.id && t.isApproved)
    }, [testimonialData, tenant?.id])

    const whatsappUrl = useMemo(() => {
        if (!tenant?.whatsapp) return ""
        const message = encodeURIComponent(`Olá, gostaria de agendar com ${tenant.fullName || tenant.name}!`)
        return `https://wa.me/${tenant.whatsapp}?text=${message}`
    }, [tenant?.fullName, tenant?.name, tenant?.whatsapp])

    const availabilityByEmployee = useMemo(() => {
        const map = new Map<string, StaffAvailabilityRecord[]>()
        availabilityRecords.forEach(slot => {
            const existing = map.get(slot.employeeId) ?? []
            existing.push(slot)
            map.set(slot.employeeId, existing)
        })
        return map
    }, [availabilityRecords])

    const employeesWithSchedules = useMemo<EmployeeWithSchedule[]>(() => {
        return employeeRecords.map(employee => {
            const slots = availabilityByEmployee.get(employee.id) ?? []
            return {
                ...employee,
                name: employee.fullName,
                workingHours: buildScheduleFromSlots(slots),
                specialties: employee.specialties ?? ["Atendimento completo"],
            }
        })
    }, [employeeRecords, availabilityByEmployee])

    const [step, setStep] = useState<Step>('service')
    const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithSchedule | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'card' | 'local' | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authError, setAuthError] = useState("")
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [isCompletingBooking, setIsCompletingBooking] = useState(false)
    const showSummary = step === 'confirmation' || step === 'payment' || step === SUCCESS_STEP
    const tenantPhone = tenant?.whatsapp ? `+${tenant.whatsapp}` : null



    const voucherCode = useMemo(() => {
        if (!selectedService) {
            return "BF0000"
        }
        const datePart = format(selectedDate, "ddMM")
        const serviceFragment = selectedService.id.replace(/[^A-Za-z0-9]/g, "")
        const servicePart = serviceFragment.slice(-2).padStart(2, "0").toUpperCase()
        return `BF${datePart}${servicePart}`
    }, [selectedDate, selectedService])

    // Up-sell Logic: Find a service for the next slot
    const upsellService = useMemo(() => {
        if (step !== "success" || !selectedTime || !tenant || !selectedService) return null

        const slotOptions = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
        const currentIdx = slotOptions.indexOf(selectedTime)
        if (currentIdx === -1 || currentIdx === slotOptions.length - 1) return null

        const nextSlot = slotOptions[currentIdx + 1]
        const otherServices = serviceRecords.filter(service => service.tenantId === tenant.id && service.id !== selectedService.id)
        if (otherServices.length === 0) return null

        const candidate = otherServices.find(service => service.durationMinutes <= 60) || otherServices[0]
        const hasConflict = appointmentRecords.some(apt => {
            if (apt.tenantId !== tenant.id || !apt.startAt) return false
            const aptStart = new Date(apt.startAt)
            if (!isSameDay(aptStart, selectedDate)) return false
            return format(aptStart, "HH:mm") === nextSlot
        })

        return hasConflict ? null : { service: candidate, time: nextSlot }
    }, [step, selectedTime, tenant, selectedService, serviceRecords, appointmentRecords, selectedDate])

    // Client Info State
    const [clientData, setClientData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
        isExisting: false
    })
    const [authenticatedCustomer, setAuthenticatedCustomer] = useState<ClientRecord | null>(null)

    const isCpfReady = normalizeCpf(clientData.cpf).length === 11
    const authMode: 'login' | 'register' = clientData.isExisting ? "login" : "register"
    const canSubmitAuthentication = authMode === "login"
        ? Boolean(isCpfReady && clientData.password)
        : Boolean(isCpfReady && clientData.name && clientData.email && clientData.phone && clientData.password)

    const customersByDocument = useMemo(() => {
        const map = new Map<string, ClientRecord>()
        customerRecords.forEach(customer => {
            if (customer.document) {
                map.set(normalizeCpf(customer.document), customer)
            }
        })
        return map
    }, [customerRecords])

    const customersByEmail = useMemo(() => {
        const map = new Map<string, ClientRecord>()
        customerRecords.forEach(customer => {
            if (customer.email) {
                map.set(customer.email.toLowerCase(), customer)
            }
        })
        return map
    }, [customerRecords])

    const tenantEmployees = useMemo(() => {
        if (!tenant) return employeesWithSchedules
        return employeesWithSchedules.filter(employee => employee.tenantId === tenant.id)
    }, [employeesWithSchedules, tenant])

    // Filtrar profissionais disponíveis para o serviço selecionado
    const availableProfessionalsForService = useMemo(() => {
        if (!selectedService) return tenantEmployees

        // Filtrar profissionais que têm o serviço nas suas specialties
        const filtered = tenantEmployees.filter(employee =>
            employee.specialties && employee.specialties.includes(selectedService.id)
        )

        // Se nenhum profissional está vinculado, mostrar todos (fallback)
        return filtered.length > 0 ? filtered : tenantEmployees
    }, [selectedService, tenantEmployees])

    useEffect(() => {
        setIsAuthenticated(false)
        setAuthError("")
        setAuthenticatedCustomer(null)

        // Check if customer exists as soon as CPF is ready
        const digits = normalizeCpf(clientData.cpf)
        if (digits.length === 11) {
            const exists = customersByDocument.has(digits)
            if (exists) {
                setClientData(prev => ({ ...prev, isExisting: true }))
            } else {
                setClientData(prev => ({ ...prev, isExisting: false }))
            }
        } else {
            // Reset to registration mode if CPF is incomplete or being edited
            setClientData(prev => ({ ...prev, isExisting: false }))
        }
    }, [clientData.cpf, customersByDocument])

    const handleAuthentication = async () => {
        setIsAuthenticating(true)
        setAuthError("")

        try {
            if (!tenant) {
                setAuthError("Selecione um salão válido antes de continuar.")
                return
            }

            const normalizedCpfValue = normalizeCpf(clientData.cpf)

            if (authMode === "login") {
                if (normalizedCpfValue.length !== 11 || !clientData.password) {
                    setAuthError("Informe CPF e senha para prosseguir.")
                    return
                }

                const existingCustomer = customersByDocument.get(normalizedCpfValue)
                if (!existingCustomer) {
                    setAuthError("CPF não identificado. Faça seu primeiro acesso.")
                    return
                }

                if (!supabaseReady || !supabase) {
                    setAuthError("Serviço indisponível. Tente novamente em instantes.")
                    return
                }

                const { data: credential, error } = await supabase
                    .from("customer_credentials")
                    .select("id, secret_hash")
                    .eq("tenant_id", tenant.id)
                    .eq("customer_id", existingCustomer.id)
                    .eq("identity_type", "cpf")
                    .maybeSingle()

                if (error || !credential) {
                    console.error("[customer_credentials]", error?.message)
                    setAuthError("Não encontramos sua senha. Tente redefinir ou crie um novo acesso.")
                    return
                }

                const storedSecret = credential.secret_hash ?? ""
                const isValidSecret = storedSecret
                    ? storedSecret.startsWith("$2")
                        ? await bcrypt.compare(clientData.password, storedSecret)
                        : storedSecret === clientData.password
                    : false

                if (!isValidSecret) {
                    setAuthError("Senha incorreta. Tente novamente.")
                    return
                }

                setClientData(prev => ({
                    ...prev,
                    name: existingCustomer.name,
                    email: existingCustomer.email,
                    phone: existingCustomer.phone,
                    cpf: existingCustomer.document ? formatCpfDisplay(existingCustomer.document) : prev.cpf,
                    isExisting: true,
                }))
                setAuthenticatedCustomer(existingCustomer)
                setIsAuthenticated(true)
            } else {
                if (
                    normalizedCpfValue.length !== 11 ||
                    !clientData.name ||
                    !clientData.email ||
                    !clientData.phone ||
                    !clientData.password
                ) {
                    setAuthError("Preencha todos os campos para criar sua conta.")
                    return
                }

                if (customersByDocument.get(normalizedCpfValue)) {
                    setAuthError("CPF já cadastrado. Faça login com sua senha.")
                    return
                }

                if (!supabaseReady || !supabase) {
                    setAuthError("Serviço indisponível. Tente novamente em instantes.")
                    return
                }

                const hashedSecret = await bcrypt.hash(clientData.password, 8)
                const { data: createdCustomer, error: createCustomerError } = await supabase
                    .from("customers")
                    .insert({
                        tenant_id: tenant.id,
                        full_name: clientData.name,
                        email: clientData.email,
                        phone: clientData.phone,
                        document: normalizedCpfValue,
                        status: "active",
                        loyalty_points: 0,
                    })
                    .select("id, tenant_id, full_name, email, phone, document, last_visit_at, total_spent, loyalty_points, status")
                    .single()

                if (createCustomerError || !createdCustomer) {
                    console.error("[customers.insert]", createCustomerError?.message)
                    setAuthError("Não foi possível criar seu perfil agora. Tente novamente.")
                    return
                }

                const credentialPayload = [
                    {
                        tenant_id: tenant.id,
                        customer_id: createdCustomer.id,
                        identity_type: "cpf",
                        identity_value: normalizedCpfValue,
                        secret_hash: hashedSecret,
                    },
                ]

                if (clientData.email) {
                    credentialPayload.push({
                        tenant_id: tenant.id,
                        customer_id: createdCustomer.id,
                        identity_type: "email",
                        identity_value: clientData.email.toLowerCase(),
                        secret_hash: hashedSecret,
                    })
                }

                const { error: credentialError } = await supabase
                    .from("customer_credentials")
                    .insert(credentialPayload)

                if (credentialError) {
                    console.error("[customer_credentials.insert]", credentialError.message)
                    setAuthError("Conta criada, mas não conseguimos salvar sua senha. Tente novamente.")
                    return
                }

                const normalizedCustomer: ClientRecord = {
                    id: createdCustomer.id,
                    tenantId: tenant.id,
                    name: createdCustomer.full_name,
                    email: createdCustomer.email ?? "",
                    phone: createdCustomer.phone ?? "",
                    document: createdCustomer.document ?? undefined,
                    lastVisit: createdCustomer.last_visit_at ?? new Date().toISOString(),
                    totalSpent: Number(createdCustomer.total_spent ?? 0),
                    status: (createdCustomer.status as ClientRecord["status"]) ?? "active",
                    avatar: "",
                    loyaltyPoints: createdCustomer.loyalty_points ?? undefined,
                }

                setClientData(prev => ({
                    ...prev,
                    name: normalizedCustomer.name,
                    email: normalizedCustomer.email,
                    phone: normalizedCustomer.phone,
                    isExisting: true,
                }))
                setAuthenticatedCustomer(normalizedCustomer)
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.error("[handleAuthentication]", error)
            setAuthError("Não foi possível validar seus dados. Tente novamente.")
        } finally {
            setIsAuthenticating(false)
        }
    }

    const handleWhatsAppContact = () => {
        if (!whatsappUrl) return
        window.open(whatsappUrl, "_blank")
    }

    const tenantServices = useMemo(() => {
        if (!tenant) return serviceRecords
        return serviceRecords.filter(service => service.tenantId === tenant.id)
    }, [serviceRecords, tenant])



    const suggestedCombos = useMemo(() => {
        if (!tenant) return comboRecords.slice(0, 2)
        return comboRecords.filter(combo => combo.tenantId === tenant.id).slice(0, 2)
    }, [comboRecords, tenant])

    useEffect(() => {
        if (selectedService && !tenantServices.some(service => service.id === selectedService.id)) {
            setSelectedService(null)
        }
    }, [tenantServices, selectedService])

    useEffect(() => {
        if (selectedEmployee && !tenantEmployees.some(employee => employee.id === selectedEmployee.id)) {
            setSelectedEmployee(null)
        }
    }, [tenantEmployees, selectedEmployee])

    // Dynamic Slot Generation
    const timeSlots = useMemo(() => {
        if (!selectedService || !selectedEmployee || !selectedDate || !tenant) return []

        const slots: string[] = []
        const dayOfWeek = weekDayKeys[selectedDate.getDay()]
        const employeeSchedule = selectedEmployee.workingHours[dayOfWeek]

        if (!employeeSchedule || employeeSchedule.length === 0) return []

        const intervalStep = 15
        const serviceTotalDuration =
            getServiceBuffer(selectedService, "bufferBefore") +
            selectedService.durationMinutes +
            getServiceBuffer(selectedService, "bufferAfter")

        employeeSchedule.forEach(shift => {
            const [startH, startM] = shift.start.split(":").map(Number)
            const [endH, endM] = shift.end.split(":").map(Number)

            let currentTime = new Date(selectedDate)
            currentTime.setHours(startH, startM, 0, 0)

            const endTime = new Date(selectedDate)
            endTime.setHours(endH, endM, 0, 0)

            while (currentTime.getTime() + serviceTotalDuration * 60000 <= endTime.getTime()) {
                const slotTime = format(currentTime, "HH:mm")

                const hasConflict = appointmentRecords.some(apt => {
                    if (apt.tenantId !== tenant.id || !apt.startAt) return false
                    const aptStart = new Date(apt.startAt)
                    if (!isSameDay(aptStart, selectedDate)) return false

                    const aptDuration = apt.durationMinutes ?? selectedService.durationMinutes
                    const aptEnd = apt.endAt ? new Date(apt.endAt) : new Date(aptStart.getTime() + aptDuration * 60000)

                    const targetStart = new Date(currentTime)
                    const targetEnd = new Date(currentTime.getTime() + serviceTotalDuration * 60000)

                    const overlaps = targetStart < aptEnd && targetEnd > aptStart
                    if (!overlaps) return false

                    if (tenant.schedulingType === "individual") {
                        return apt.employeeId === selectedEmployee.id
                    }

                    return true
                })

                if (!hasConflict) {
                    slots.push(slotTime)
                }

                currentTime = new Date(currentTime.getTime() + intervalStep * 60000)
            }
        })

        return slots
    }, [selectedService, selectedEmployee, selectedDate, tenant, appointmentRecords])

    const activeTime = selectedTime ?? (timeSlots[0] ?? null)

    const handleNext = () => {
        if (step === 'service' && selectedService) setStep('professional')
        else if (step === 'professional' && selectedEmployee) setStep('datetime')
        else if (step === 'datetime' && selectedDate && activeTime) {
            if (!selectedTime && activeTime) {
                setSelectedTime(activeTime)
            }
            setStep('client_info')
        }
        else if (step === 'client_info') {
            if (!isCpfReady || !isAuthenticated || !authenticatedCustomer) return
            setStep('confirmation')
        }
        else if (step === 'confirmation') setStep('payment')
    }

    const handleBack = () => {
        if (step === 'professional') setStep('service')
        else if (step === 'datetime') setStep('professional')
        else if (step === 'client_info') setStep('datetime')
        else if (step === 'confirmation') setStep('client_info')
        else if (step === 'payment') setStep('confirmation')
    }

    const handleConfirmBooking = async () => {
        if (!tenant || !selectedService || !selectedEmployee || !selectedDate || !selectedTime || !authenticatedCustomer) {
            return
        }

        if (!supabaseReady || !supabase) {
            setStep('success')
            return
        }

        setIsCompletingBooking(true)

        try {
            const [hour, minute] = selectedTime.split(":").map(Number)
            const startDateTime = new Date(selectedDate)
            startDateTime.setHours(hour, minute, 0, 0)

            const totalDuration =
                selectedService.durationMinutes +
                getServiceBuffer(selectedService, "bufferBefore") +
                getServiceBuffer(selectedService, "bufferAfter")

            const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000)

            const { error } = await supabase
                .from("appointments")
                .insert({
                    tenant_id: tenant.id,
                    service_id: selectedService.id,
                    employee_id: selectedEmployee.id,
                    customer_id: authenticatedCustomer.id,
                    start_at: startDateTime.toISOString(),
                    end_at: endDateTime.toISOString(),
                    duration_minutes: selectedService.durationMinutes,
                    price: selectedService.price,
                    currency: selectedService.currency,
                    status: "scheduled",
                    channel: "public_portal",
                    metadata: {
                        payment_method: selectedPaymentMethod,
                        booking_source: "booking_funnel",
                    },
                })

            if (error) {
                throw error
            }
            // 5. Success!

            // --- EMAIL NOTIFICATION (ASYNC) ---
            const appointmentDate = new Date(selectedDate);
            appointmentDate.setHours(Number(activeTime.split(':')[0]), Number(activeTime.split(':')[1]));

            fetch('/api/send-email/booking-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerEmail: authenticatedCustomer.email,
                    customerName: authenticatedCustomer.name,
                    serviceName: selectedService.name,
                    professionalName: selectedEmployee.name,
                    date: appointmentDate.toISOString(),
                    tenantName: tenant.fullName,
                    address: tenant.settings?.address
                })
            }).catch(console.error); // Log error but don't block UI success
            // ----------------------------------

            setStep('success')
        } catch (error) {
            console.error(error)
            alert("Erro ao confirmar agendamento")
        } finally {
            setIsCompletingBooking(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
    }

    if (!tenant && isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-600 dark:text-zinc-400 font-medium">Carregando experiência de agendamento...</p>
                </div>
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
                <div className="space-y-4 max-w-md">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Ops! Salão não encontrado</h1>
                    <p className="text-gray-600 dark:text-zinc-400">Verifique se o link do agendamento está correto ou fale com o suporte.</p>
                    <Button onClick={() => router.push("/")}>Voltar para o início</Button>
                </div>
            </div>
        )
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">Agendado!</h1>
                        <p className="text-xl text-gray-600 dark:text-zinc-400 font-medium">Tudo certo, {clientData.name}. Te esperamos lá! 🎉</p>
                    </div>

                    <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
                        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center text-lg font-black text-primary">
                                {tenantBadge}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">{selectedService?.name}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                    Voucher: #{voucherCode}
                                </span>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Apresente este código na recepção.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Order Bump Section */}
                    {upsellService && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="p-6 rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
                                <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-3xl uppercase tracking-widest shadow-lg">
                                    Oferta Especial
                                </div>
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white leading-tight">Que tal aproveitar?</h4>
                                            <p className="text-xs text-gray-600 dark:text-zinc-400">Vimos que há um horário vago para {upsellService.service.name.toLowerCase()} logo após o seu.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white dark:border-zinc-800 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{upsellService.service.name}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase">Às {upsellService.time} • R$ {upsellService.service.price},00</p>
                                        </div>
                                        <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 active:scale-95 transition-all">
                                            Adicionar
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {suggestedCombos.length > 0 && (
                        <div className="space-y-3 w-full">
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">Complete sua experiência</h3>
                            <div className="grid gap-3">
                                {suggestedCombos.map(combo => (
                                    <Card key={combo.id} className="p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 text-left flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{combo.name}</p>
                                                <p className="text-xs text-gray-600">{combo.description}</p>
                                            </div>
                                            <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                                                R$ {combo.price}
                                            </Badge>
                                        </div>
                                        <Button className="rounded-xl w-full" variant="outline">
                                            Reservar combo
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => {
                                console.log("Redirecting to profile...", { email: clientData.email, tenantSlug });
                                if (clientData.email) {
                                    sessionStorage.setItem('customerEmail', clientData.email)
                                    sessionStorage.setItem('userType', 'customer')
                                    sessionStorage.setItem('tenantSlug', tenantSlug)
                                    // Use window.location.href to ensure a hard redirect, bypassing any router issues
                                    window.location.href = `/${tenantSlug}/profile`
                                } else {
                                    console.error("Missing email for redirection");
                                    // Fallback if email is missing (shouldn't happen if flow is correct)
                                    window.location.href = `/${tenantSlug}/profile`
                                }
                            }}
                            variant="outline"
                            className="flex-1 h-14 rounded-full border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Ver Meus Agendamentos
                        </Button>
                        <Button
                            onClick={() => router.push(`/${tenantSlug}/book`)}
                            className="flex-1 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all"
                        >
                            Novo Agendamento
                        </Button>
                    </div>
                </motion.div>
                <FloatingWhatsApp phone={tenant.whatsapp} tenantName={tenant.name} />
            </div>
        )
    }

    return (
        <div style={themeStyle} className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-primary/20">
            {/* Elegant Header */}
            <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-6 py-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/30">
                            {tenantBadge}
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">{tenant.fullName}</h1>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-xs font-medium">
                                <MapPin className="w-3 h-3" />
                                {tenant.name}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/${tenantSlug}/shop`)}
                            className="rounded-full border-gray-200 dark:border-zinc-800 font-semibold text-xs gap-2 hover:bg-gray-50"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Loja
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/${tenantSlug}/login`)}
                            className="rounded-full border-gray-200 dark:border-zinc-800 font-semibold text-xs gap-2 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Minha Conta
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full border-gray-200 dark:border-zinc-800 hover:bg-gray-50"
                            onClick={handleWhatsAppContact}
                        >
                            <Phone className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 pb-32 space-y-8">
                <CustomerTrustBar tenant={tenant} />
                <CustomerReviews tenantName={tenant.fullName} />
                <Card className="p-5 sm:p-6 rounded-[2rem] border-none bg-gradient-to-br from-primary/5 via-white to-slate-50 dark:from-primary/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Precisa de ajuda?</p>
                            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                                Concierge BeautyFlow disponível para você
                            </p>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">
                                Resposta média em menos de 3 minutos via WhatsApp.
                            </p>
                        </div>
                    </div>
                    <Button className="rounded-2xl h-12 font-bold" onClick={handleWhatsAppContact}>
                        Falar pelo WhatsApp
                    </Button>
                </Card>

                {/* Hero & Highlights Section - Only on first step */}
                {step === 'service' && (
                    <div className="mb-8 mt-6">
                        {/* Welcome Message */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                Bem-vindo ao <span className="text-primary">{tenant.name}</span>
                            </h2>
                            <p className="text-slate-500 dark:text-zinc-400 max-w-lg">
                                {tenant.description}
                            </p>
                        </div>

                        {/* Highlights Carousel (VIPs / Awards) */}
                        {tenantHighlights.length > 0 && (
                            <div className="mb-10 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide flex gap-4">
                                {tenantHighlights.map((highlight) => (
                                    <div key={highlight.id} className="relative min-w-[280px] h-40 rounded-2xl overflow-hidden shadow-lg group">
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={highlight.imageUrl} alt={highlight.title} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 p-4 z-20 text-white">
                                            <div className="flex items-center gap-2 mb-1">
                                                {highlight.type === 'vip_client' && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                                {highlight.type === 'award' && <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                    Destaque
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight">{highlight.title}</h3>
                                            <p className="text-xs text-white/80 line-clamp-1">{highlight.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Tracker */}
                <div className="mb-10">
                    <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Seu progresso</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {STEP_SEQUENCE.map((flowStep, index) => {
                            const Icon = STEP_DETAILS[flowStep].icon
                            const currentIndex = step === SUCCESS_STEP ? STEP_SEQUENCE.length : Math.max(STEP_SEQUENCE.indexOf(step), 0)
                            const isCompleted = index < currentIndex
                            const isCurrent = step === flowStep
                            return (
                                <div
                                    key={flowStep}
                                    className={cn(
                                        "rounded-xl border bg-white dark:bg-zinc-900 p-5 transition-all hover:shadow-md",
                                        isCompleted && "border-green-200 bg-green-50/50 dark:bg-green-900/10",
                                        isCurrent && "border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg",
                                        !isCompleted && !isCurrent && "border-gray-100 dark:border-zinc-800"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                isCompleted
                                                    ? "bg-green-600 text-white"
                                                    : isCurrent
                                                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                                                        : "bg-gray-100 text-gray-400 dark:bg-zinc-800"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-bold mb-1",
                                                isCompleted && "text-green-700 dark:text-green-400",
                                                isCurrent && "text-blue-700 dark:text-blue-400",
                                                !isCompleted && !isCurrent && "text-gray-600 dark:text-zinc-400"
                                            )}>
                                                {STEP_DETAILS[flowStep].label}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                                                {STEP_DETAILS[flowStep].description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step: Select Service */}
                    {step === 'service' && (
                        <motion.div
                            key="service"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-6"
                        >
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">O que vamos fazer hoje?</h2>
                                <p className="text-gray-600 dark:text-zinc-400">Selecione o serviço desejado para agendar.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tenantServices.map(service => (
                                    <Card
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 transition-all cursor-pointer group active:scale-[0.98]",
                                            selectedService?.id === service.id
                                                ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/10"
                                                : "border-transparent bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-800 shadow-sm"
                                        )}
                                    >
                                        {service.imageUrl && (
                                            <div className="mb-4 -mx-6 -mt-6 h-32 relative overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{service.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2">{service.description}</p>
                                            </div>
                                            {selectedService?.id === service.id && (
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex gap-4 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.durationMinutes}m</span>
                                                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> R$ {service.price}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Select Professional */}
                    {step === 'professional' && (
                        <motion.div
                            key="professional"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Escolha um especialista</h2>
                                <p className="text-gray-600 dark:text-zinc-400">
                                    {availableProfessionalsForService.length > 0
                                        ? "Quem você gostaria que realizasse seu atendimento?"
                                        : "Nenhum profissional disponível para este serviço. Tente outro horário ou serviço."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {availableProfessionalsForService.map(emp => (
                                    <Card
                                        key={emp.id}
                                        onClick={() => {
                                            setSelectedEmployee(emp)
                                            setSelectedTime(null)
                                        }}
                                        className={cn(
                                            "p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer text-center space-y-4 group active:scale-[0.98]",
                                            selectedEmployee?.id === emp.id
                                                ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/10"
                                                : "border-transparent bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-800 shadow-sm"
                                        )}
                                    >
                                        <div className="relative mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-md">
                                            <User className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                                            {selectedEmployee?.id === emp.id && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{emp.name}</h3>
                                            <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold tracking-tighter opacity-70">Expert</Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Date & Time */}
                    {step === 'datetime' && (
                        <motion.div
                            key="datetime"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 -mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Quando será sua visita?</h2>
                                <p className="text-gray-600 dark:text-zinc-400">Selecione o melhor dia e horário para você.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Date Picker */}
                                <div className="flex gap-3 overflow-x-auto pb-4 invisible-scrollbar">
                                    {Array.from({ length: 14 }).map((_, i) => {
                                        const date = addDays(startOfToday(), i)
                                        const isSelected = isSameDay(date, selectedDate)
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedDate(date)
                                                    setSelectedTime(null)
                                                }}
                                                className={cn(
                                                    "flex flex-col items-center justify-center min-w-[72px] h-24 rounded-3xl border-2 transition-all cursor-pointer",
                                                    isSelected
                                                        ? "border-primary bg-primary text-white shadow-xl shadow-primary/20"
                                                        : "border-transparent bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                                                )}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-2 opacity-70">
                                                    {format(date, "EEE", { locale: ptBR })}
                                                </span>
                                                <span className="text-xl font-black leading-none">{format(date, "dd")}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Time Grid */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Horários disponíveis</h4>
                                    {timeSlots.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center text-sm text-gray-600 dark:text-zinc-400">
                                            Nenhum horário disponível neste dia. Escolha outra data ou profissional.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {timeSlots.map(time => (
                                                <Button
                                                    key={time}
                                                    variant={activeTime === time ? "default" : "outline"}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={cn(
                                                        "h-14 rounded-2xl font-bold transition-all",
                                                        activeTime === time
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]"
                                                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white hover:bg-white"
                                                    )}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Client Info */}
                    {step === 'client_info' && (
                        <motion.div
                            key="client_info"
                            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 -mb-4">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Falta pouco!</h2>
                                <p className="text-gray-600 dark:text-zinc-400">Preencha seus dados para finalizarmos o agendamento.</p>
                            </div>

                            <div className="space-y-6 max-w-lg">
                                {/* CPF Field - Primary ID */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">CPF (Identificação)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="000.000.000-00"
                                            value={clientData.cpf}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                const normalized = normalizeCpf(val)
                                                const existing = normalized.length === 11 ? customersByDocument.get(normalized) : undefined
                                                setClientData((prev) => {
                                                    if (existing) {
                                                        return {
                                                            ...prev,
                                                            cpf: val,
                                                            isExisting: true,
                                                            name: existing.name,
                                                            email: existing.email,
                                                            phone: existing.phone || prev.phone,
                                                            password: ""
                                                        }
                                                    }

                                                    if (normalized.length === 11) {
                                                        return {
                                                            ...prev,
                                                            cpf: val,
                                                            isExisting: false,
                                                            name: "",
                                                            email: prev.email,
                                                            phone: prev.phone,
                                                            password: ""
                                                        }
                                                    }

                                                    return { ...prev, cpf: val, isExisting: false }
                                                })
                                            }}
                                            className="w-full h-16 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isCpfReady && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {clientData.isExisting ? (
                                                <div className="space-y-4">
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-full px-3 py-1">
                                                        Cliente Identificado: {clientData.name}
                                                    </Badge>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Sua Senha</label>
                                                        <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={clientData.password}
                                                            onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-1">
                                                        Primeiro Acesso: Criar Perfil
                                                    </Badge>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nome Completo</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Como gostaria de ser chamado?"
                                                            value={clientData.name}
                                                            onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">E-mail</label>
                                                        <input
                                                            type="email"
                                                            placeholder="seu@email.com"
                                                            value={clientData.email}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                const existing = customersByEmail.get(val.toLowerCase())
                                                                setClientData((prev) => {
                                                                    if (existing) {
                                                                        return {
                                                                            ...prev,
                                                                            email: val,
                                                                            isExisting: true,
                                                                            name: existing.name,
                                                                            cpf: existing.document ? formatCpfDisplay(existing.document) : prev.cpf,
                                                                            phone: existing.phone || prev.phone,
                                                                            password: ""
                                                                        }
                                                                    }
                                                                    return { ...prev, email: val }
                                                                })
                                                            }}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">WhatsApp</label>
                                                        <input
                                                            type="tel"
                                                            placeholder="(11) 99999-0000"
                                                            value={clientData.phone}
                                                            onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Criar Senha para Acesso</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Mínimo 6 caracteres"
                                                            value={clientData.password}
                                                            onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                                                            className="w-full h-16 px-6 rounded-2xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white"
                                                        />
                                                        <div className="flex justify-end mt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(`/${tenantSlug}/forgot-password`, '_blank')}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline outline-none"
                                                            >
                                                                Esqueci minha senha
                                                            </button>
                                                        </div>

                                                        <div className="pt-2">
                                                            <p className="text-xs text-muted-foreground text-center px-4">
                                                                Ao continuar, você cria uma conta <strong>BeautyFlow</strong> para agilizar seus agendamentos neste e em outros salões parceiros, concordando com nossos Termos de Uso e Política de Privacidade.
                                                            </p>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Card className="p-6 rounded-[2rem] bg-emerald-500/5 border-emerald-500/10 flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                    {clientData.isExisting
                                        ? "Bom te ver de novo! Entre com sua senha para prosseguir."
                                        : "Com sua senha, você poderá consultar seu histórico e pontos de fidelidade a qualquer momento."}
                                </p>
                            </Card>

                            <Card className="p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">Portal do cliente</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">Login obrigatório antes de confirmar</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">
                                    Garantimos sua segurança e evitamos agendamentos falsos. Após o login, enviaremos confirmações, lembretes,
                                    promoções e você terá acesso ao histórico completo no seu portal.
                                </p>

                                {authError && (
                                    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-600 dark:text-rose-400 text-sm font-medium">
                                        {authError}
                                    </div>
                                )}

                                {isAuthenticated ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Autenticado como {clientData.name || clientData.email}
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="rounded-full"
                                            onClick={() => {
                                                setIsAuthenticated(false)
                                                setClientData(prev => ({ ...prev, password: "" }))
                                            }}
                                        >
                                            Trocar cliente
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                            <Button
                                                className="rounded-2xl h-14 font-black"
                                                disabled={!canSubmitAuthentication || isAuthenticating || !isCpfReady}
                                                onClick={handleAuthentication}
                                            >
                                                {isAuthenticating
                                                    ? "Validando dados..."
                                                    : authMode === "login"
                                                        ? "Entrar e continuar"
                                                        : "Criar acesso e continuar"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-14 rounded-2xl text-gray-600 hover:text-primary"
                                                onClick={handleWhatsAppContact}
                                            >
                                                Precisa de ajuda?
                                            </Button>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                                            <div className="mt-1 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Smart Notifications</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    Você receberá a confirmação e lembretes deste agendamento via <span className="font-bold text-emerald-600 dark:text-emerald-400">WhatsApp</span> e <span className="font-bold text-primary">OnePush</span> no portal do cliente.
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 uppercase tracking-wider">Ativado</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div >
                    )
                    }

                    {/* Step: Confirmation */}
                    {
                        step === 'confirmation' && (
                            <motion.div
                                key="confirmation"
                                initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4 -mb-4">
                                    <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Confirme seu agendamento</h2>
                                    <p className="text-gray-600 dark:text-zinc-400">Revise os detalhes antes de finalizar.</p>
                                </div>

                                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Serviço</p>
                                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{selectedService?.name}</p>
                                                <p className="text-gray-600 text-sm font-medium">{selectedService?.durationMinutes} minutos • R$ {selectedService?.price}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Profissional</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-500">
                                                        {selectedEmployee?.name.charAt(0)}
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEmployee?.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Data e Hora</p>
                                                <div className="flex items-center gap-3">
                                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Clock className="w-5 h-5 text-primary" />
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                                <p className="text-3xl font-black text-primary">R$ {selectedService?.price},00</p>
                                            </div>
                                            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                Seguro
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    }

                    {/* Step: Payment */}
                    {
                        step === 'payment' && (
                            <motion.div
                                key="payment"
                                initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4 -mb-4">
                                    <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Forma de pagamento</h2>
                                    <p className="text-gray-600 dark:text-zinc-400">Como você prefere pagar pelo serviço?</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {PAYMENT_METHODS.map((method) => (
                                        <Card
                                            key={method.id}
                                            onClick={() => setSelectedPaymentMethod(method.id)}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]",
                                                selectedPaymentMethod === method.id
                                                    ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5"
                                                    : "border-transparent bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-800 shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform text-gray-500">
                                                    <method.icon className={cn(
                                                        "w-6 h-6",
                                                        selectedPaymentMethod === method.id ? "text-primary" : "text-gray-500"
                                                    )} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{method.label}</h4>
                                                    <p className="text-xs text-gray-600 dark:text-zinc-400">{method.description}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedPaymentMethod === method.id ? "border-primary bg-primary" : "border-gray-200"
                                            )}>
                                                {selectedPaymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {selectedPaymentMethod === 'pix' && (
                                    <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-gray-900 text-white space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Total com Desconto</p>
                                            <p className="text-2xl font-black text-emerald-400">R$ {Math.floor((selectedService?.price || 0) * 0.95)},00</p>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 leading-tight">
                                                O código Pix expira em 30 minutos após a confirmação.
                                            </p>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </main >

            {
                showSummary && (
                    <section className="max-w-4xl mx-auto px-6 pb-8 space-y-4">
                        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Resumo</p>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Quase tudo pronto!</h3>
                                    </div>
                                    <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
                                        {STEP_DETAILS[step].label}
                                    </Badge>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Serviço</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedService?.name}</p>
                                        <p className="text-xs text-gray-600">{selectedService?.durationMinutes} min • R$ {selectedService?.price}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Profissional</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployee?.name}</p>
                                        <p className="text-xs text-gray-600">
                                            {selectedEmployee?.specialties?.join(", ") || "Especialidades variadas"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Horário</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeTime}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-zinc-900 p-5 space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Ajuda & suporte</p>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">Precisa ajustar algo? Fale com a equipe em segundos.</p>
                                <div className="flex flex-col gap-2">
                                    {tenant.whatsapp && (
                                        <Button variant="outline" className="rounded-2xl w-full" onClick={handleWhatsAppContact}>
                                            WhatsApp {tenant.whatsapp.substring(2)}
                                        </Button>
                                    )}
                                    {tenantPhone && (
                                        <Button variant="ghost" className="rounded-2xl w-full text-gray-600" onClick={() => window.open(`tel:${tenantPhone}`, '_blank')}>
                                            Ligar para {tenantPhone}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </section>
                )
            }

            {/* Social Proof / Testimonials */}
            {
                step === 'service' && tenantTestimonials.length > 0 && (
                    <section className="max-w-4xl mx-auto px-6 pb-12 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Quote className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-slate-900 dark:text-white">O que dizem sobre nós</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">Experiências reais</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {tenantTestimonials.map((testimonial) => (
                                <Card key={testimonial.id} className="p-5 rounded-[2rem] border-none bg-slate-50 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                            {testimonial.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={testimonial.imageUrl} alt={testimonial.customerName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                    {getInitials(testimonial.customerName)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1 text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < testimonial.rating ? 'fill-current' : 'text-slate-300 dark:text-zinc-700'}`} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-800 dark:text-zinc-300 italic leading-relaxed">
                                                "{testimonial.testimonial}"
                                            </p>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{testimonial.customerName}</p>
                                                {testimonial.customerRole && (
                                                    <p className="text-[10px] text-primary font-medium">{testimonial.customerRole}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                )
            }

            {/* Gallery Section */}
            {
                step === 'service' && tenantGallery.length > 0 && (
                    <section className="max-w-4xl mx-auto px-6 pb-20">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 text-center">Nossa Atmosfera</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-64 md:h-80 rounded-[2rem] overflow-hidden">
                            {tenantGallery.map((img, idx) => (
                                <div key={img.id} className={`relative group overflow-hidden ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }

            {/* Confidence Highlights */}
            <section className="max-w-4xl mx-auto px-6 pb-32 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500 text-center">Por que reservar com a gente</h3>
                <div className="grid gap-3 md:grid-cols-3">
                    {trustHighlights.map(item => {
                        const Icon = item.icon
                        return (
                            <div key={item.title} className="p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                                    <p className="text-xs text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Custom Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-zinc-950 dark:via-zinc-950 z-50">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
                        <span>{STEP_DETAILS[step].label}</span>
                        {selectedService && (
                            <span className="text-primary flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Voucher {voucherCode}
                            </span>
                        )}
                    </div>
                    <Button
                        disabled={
                            (step === 'service' && !selectedService) ||
                            (step === 'professional' && !selectedEmployee) ||
                            (step === 'datetime' && (!selectedDate || !activeTime)) ||
                            (step === 'client_info' && (!isCpfReady || !isAuthenticated)) ||
                            (step === 'payment' && (!selectedPaymentMethod || isCompletingBooking))
                        }
                        onClick={step === 'payment' ? handleConfirmBooking : handleNext}
                        className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/30 group transition-all active:scale-[0.98]"
                    >
                        {step === 'payment'
                            ? (isCompletingBooking ? "Confirmando..." : "Finalizar Agendamento")
                            : 'Próximo Passo'}
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </div >
    )
}
