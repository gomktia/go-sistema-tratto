-- ============================================================================
-- Seed: Service Categories (Padrão Trinks)
-- Created: 2026-07-13
-- Description: Popula categorias padrão de serviços para novos tenants
-- ============================================================================

-- Função para criar categorias padrão para um tenant
create or replace function public.seed_default_service_categories(p_tenant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
    -- Inserir categorias padrão apenas se não existirem para este tenant
    insert into public.service_categories (tenant_id, name, short_code, color, display_order, is_active)
    select
        p_tenant_id,
        name,
        short_code,
        color,
        display_order,
        true
    from (values
        ('Alongamento',   'ALO', '#FF6B6B', 1),
        ('Cabelo',        'CAB', '#4ECDC4', 2),
        ('Integral',      'INT', '#95E1D3', 3),
        ('Mão',           'MÃO', '#FFD93D', 4),
        ('Maquiagem',     'MAQ', '#F38181', 5),
        ('Sobrancelha',   'SOB', '#AA96DA', 6)
    ) as default_categories(name, short_code, color, display_order)
    where not exists (
        select 1 from public.service_categories
        where tenant_id = p_tenant_id
    );
end;
$$;

-- Comentário na função
comment on function public.seed_default_service_categories is
'Cria categorias de serviço padrão (padrão Trinks) para um tenant';

-- Trigger para criar categorias automaticamente quando um tenant é criado
create or replace function public.auto_seed_service_categories()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Chamar a função de seed para o novo tenant
    perform public.seed_default_service_categories(NEW.id);
    return NEW;
end;
$$;

-- Criar trigger (apenas se não existir)
drop trigger if exists trigger_auto_seed_service_categories on public.tenants;
create trigger trigger_auto_seed_service_categories
    after insert on public.tenants
    for each row
    execute function public.auto_seed_service_categories();

-- Seed para tenants existentes (executar uma vez)
do $$
declare
    tenant_record record;
begin
    for tenant_record in select id from public.tenants
    loop
        perform public.seed_default_service_categories(tenant_record.id);
    end loop;
end;
$$;
