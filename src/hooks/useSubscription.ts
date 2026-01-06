
import { useMemo } from 'react';
import { SUBSCRIPTION_PLANS, PlanTier, SubscriptionPlan } from '@/config/subscription';
import { differenceInDays, parseISO, isValid, addDays } from 'date-fns';

// Interface dummy para o Tenant enquanto não atualizamos o tipo global
interface TenantSubscriptionData {
    planId: PlanTier;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    trialEndsAt?: string; // ISO Date
    subscriptionEndsAt?: string; // ISO Date
}

// Simulando dados que viriam do hook useTenantBySlug ou similar
// Em produção, isso viria do objeto `tenant` carregado do banco
export function useSubscription(tenantData?: any) {

    const subscription = useMemo(() => {
        // Fallback para TRIAL se não tiver dados
        // TODO: Remover fallback quando tiver dados reais no banco
        const defaultSub: TenantSubscriptionData = {
            planId: tenantData?.planId || 'trial',
            status: tenantData?.subscriptionStatus || 'trialing',
            trialEndsAt: tenantData?.trialEndsAt
                ? tenantData.trialEndsAt
                : addDays(new Date(), 14).toISOString() // 15 dias de trial default para novos
        };

        return defaultSub;
    }, [tenantData]);

    const plan = SUBSCRIPTION_PLANS[subscription.planId];

    const isTrial = subscription.status === 'trialing';

    const daysRemaining = useMemo(() => {
        if (!isTrial || !subscription.trialEndsAt) return 0;
        const end = parseISO(subscription.trialEndsAt);
        if (!isValid(end)) return 0;
        return Math.max(0, differenceInDays(end, new Date()));
    }, [isTrial, subscription.trialEndsAt]);

    const isExpired = useMemo(() => {
        if (subscription.status === 'active') return false;
        if (isTrial && daysRemaining <= 0) return true;
        // Lógica para assinaturas vencidas entraria aqui
        return false;
    }, [subscription.status, isTrial, daysRemaining]);

    // Função para verificar permissão boolean
    const checkPermission = (feature: keyof SubscriptionPlan['features']): boolean => {
        if (isExpired) return false;

        // Se for trial válido, libera tudo (baseado na config do plano trial)
        const value = plan.features[feature];

        if (typeof value === 'boolean') return value;
        return true; // Se for numérico (limit), a verificação de permissão 'acesso' é true
    };

    // Função para verificar limites numéricos (ex: maxEmployees)
    // Retorna TRUE se ainda pode adicionar (current < max)
    const checkLimit = (feature: keyof SubscriptionPlan['features'], currentCount: number): boolean => {
        if (isExpired) return false;

        const limit = plan.features[feature];

        if (limit === 'unlimited') return true;
        if (typeof limit === 'number') return currentCount < limit;

        return false; // Fallback
    };

    return {
        plan,
        subscription,
        isTrial,
        daysRemaining,
        isExpired,
        checkPermission,
        checkLimit
    };
}

