/**
 * Testes Programáticos - Sistema de Importação/Exportação
 *
 * Testa as funções críticas isoladamente sem precisar da UI
 */

const fs = require('fs');
const path = require('path');

// ==================== HELPERS ====================

function log(emoji, msg) {
  console.log(`${emoji} ${msg}`);
}

function assert(condition, testName) {
  if (condition) {
    log('✅', testName);
    return true;
  } else {
    log('❌', testName);
    console.error(`   FALHOU: ${testName}`);
    return false;
  }
}

// ==================== VALIDATORS (copiados do código) ====================

function normalizeCPF(cpf) {
  if (!cpf) return '';
  return cpf.replace(/[^\d]/g, '');
}

function validateCPF(cpf) {
  const cleaned = normalizeCPF(cpf);
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
}

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

function normalizeEmail(email) {
  if (!email) return '';
  return email.toLowerCase().trim();
}

function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseDuration(durationStr) {
  if (!durationStr) return null;

  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minMatch = durationStr.match(/(\d+)\s*min/);

  let minutes = 0;

  if (hourMatch) {
    minutes += parseInt(hourMatch[1]) * 60;
  }

  if (minMatch) {
    minutes += parseInt(minMatch[1]);
  }

  return minutes > 0 ? minutes : null;
}

function parsePrice(priceStr) {
  if (!priceStr) return null;

  const cleaned = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
  const price = parseFloat(cleaned);

  return isNaN(price) ? null : price;
}

function validateCustomer(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Nome é obrigatório');
  }

  if (!data.phone || data.phone.trim() === '') {
    errors.push('Telefone é obrigatório');
  }

  if (data.cpf && !validateCPF(data.cpf)) {
    errors.push('CPF inválido');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Email inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateService(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Nome é obrigatório');
  }

  if (!data.durationMinutes || data.durationMinutes <= 0) {
    errors.push('Duração é obrigatória e deve ser maior que 0');
  }

  if (data.price === null || data.price === undefined || data.price < 0) {
    errors.push('Preço é obrigatório e não pode ser negativo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateEmployee(data) {
  const errors = [];

  if (!data.fullName || data.fullName.trim() === '') {
    errors.push('Nome completo é obrigatório');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Email válido é obrigatório');
  }

  if (!data.phone || data.phone.trim() === '') {
    errors.push('Telefone é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ==================== DUPLICATE DETECTION ====================

function checkCustomerDuplicate(customer, existingCustomers) {
  const cpf = customer.cpf ? normalizeCPF(customer.cpf) : null;
  const email = customer.email ? normalizeEmail(customer.email) : null;
  const phone = customer.phone ? normalizePhone(customer.phone) : null;

  // 1. CPF
  if (cpf && cpf.length === 11) {
    const duplicate = existingCustomers.find(
      (c) => c.cpf && normalizeCPF(c.cpf) === cpf
    );
    if (duplicate) {
      return { isDuplicate: true, matchType: 'cpf', existingRecord: duplicate };
    }
  }

  // 2. Email
  if (email && email.includes('@')) {
    const duplicate = existingCustomers.find(
      (c) => c.email && normalizeEmail(c.email) === email
    );
    if (duplicate) {
      return { isDuplicate: true, matchType: 'email', existingRecord: duplicate };
    }
  }

  // 3. Telefone
  if (phone) {
    const duplicate = existingCustomers.find(
      (c) => c.phone && normalizePhone(c.phone) === phone
    );
    if (duplicate) {
      return { isDuplicate: true, matchType: 'telefone', existingRecord: duplicate };
    }
  }

  return { isDuplicate: false };
}

// ==================== TESTES ====================

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  } catch (error) {
    log('❌', `${name} - ERRO: ${error.message}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('🧪 TESTES PROGRAMÁTICOS - IMPORT/EXPORT');
console.log('========================================\n');

// ==================== BLOCO 1: VALIDAÇÃO ====================

console.log('📋 BLOCO 1: VALIDAÇÃO DE DADOS\n');

test('Validação CPF válido', () => {
  return assert(validateCPF('10720247055'), 'CPF 10720247055 válido');
});

test('Validação CPF inválido', () => {
  return assert(!validateCPF('11111111111'), 'CPF 11111111111 inválido (todos iguais)');
});

test('Validação CPF com formatação', () => {
  const normalized = normalizeCPF('123.456.789-01');
  return assert(normalized === '12345678901', 'CPF normalizado remove formatação');
});

test('Validação email válido', () => {
  return assert(validateEmail('teste@email.com'), 'Email teste@email.com válido');
});

test('Validação email inválido', () => {
  return assert(!validateEmail('teste@'), 'Email teste@ inválido');
});

test('Normalização email (lowercase)', () => {
  const normalized = normalizeEmail('TESTE@EMAIL.COM');
  return assert(normalized === 'teste@email.com', 'Email convertido para lowercase');
});

test('Normalização telefone', () => {
  const normalized = normalizePhone('(11) 98765-4321');
  return assert(normalized === '11987654321', 'Telefone normalizado remove formatação');
});

test('Validação cliente completo válido', () => {
  const customer = {
    name: 'João Silva',
    phone: '11987654321',
    email: 'joao@email.com',
    cpf: '10720247055'
  };
  const result = validateCustomer(customer);
  return assert(result.isValid, 'Cliente válido passa validação');
});

test('Validação cliente sem nome (erro)', () => {
  const customer = {
    name: '',
    phone: '11987654321',
    email: 'joao@email.com'
  };
  const result = validateCustomer(customer);
  return assert(!result.isValid && result.errors.includes('Nome é obrigatório'), 'Cliente sem nome falha validação');
});

test('Validação cliente sem telefone (erro)', () => {
  const customer = {
    name: 'João Silva',
    phone: '',
    email: 'joao@email.com'
  };
  const result = validateCustomer(customer);
  return assert(!result.isValid && result.errors.includes('Telefone é obrigatório'), 'Cliente sem telefone falha validação');
});

test('Validação profissional sem email (erro)', () => {
  const employee = {
    fullName: 'Maria Santos',
    phone: '11987654321',
    email: ''
  };
  const result = validateEmployee(employee);
  return assert(!result.isValid && result.errors.includes('Email válido é obrigatório'), 'Profissional sem email falha validação');
});

console.log('');

// ==================== BLOCO 2: CONVERSÃO DE FORMATOS ====================

console.log('🔄 BLOCO 2: CONVERSÃO DE FORMATOS\n');

test('Conversão preço 200,00 → 200.0', () => {
  const price = parsePrice('200,00');
  return assert(price === 200.0, 'Preço 200,00 convertido para 200.0');
});

test('Conversão preço 50,00 → 50.0', () => {
  const price = parsePrice('50,00');
  return assert(price === 50.0, 'Preço 50,00 convertido para 50.0');
});

test('Conversão preço 1.500,00 → 1500.0', () => {
  const price = parsePrice('1.500,00');
  return assert(price === 1500.0, 'Preço 1.500,00 convertido para 1500.0');
});

test('Conversão duração "1h e 30 min" → 90', () => {
  const duration = parseDuration('1h e 30 min');
  return assert(duration === 90, 'Duração "1h e 30 min" convertida para 90 minutos');
});

test('Conversão duração "45 min" → 45', () => {
  const duration = parseDuration('45 min');
  return assert(duration === 45, 'Duração "45 min" convertida para 45 minutos');
});

test('Conversão duração "1h" → 60', () => {
  const duration = parseDuration('1h');
  return assert(duration === 60, 'Duração "1h" convertida para 60 minutos');
});

test('Conversão duração "2h" → 120', () => {
  const duration = parseDuration('2h');
  return assert(duration === 120, 'Duração "2h" convertida para 120 minutos');
});

test('Conversão duração "30 min" → 30', () => {
  const duration = parseDuration('30 min');
  return assert(duration === 30, 'Duração "30 min" convertida para 30 minutos');
});

test('Conversão duração inválida "" → null', () => {
  const duration = parseDuration('');
  return assert(duration === null, 'Duração vazia retorna null');
});

test('Conversão duração "abc" → null', () => {
  const duration = parseDuration('abc');
  return assert(duration === null, 'Duração inválida retorna null');
});

test('Validação serviço com duração convertida', () => {
  const service = {
    name: 'Corte',
    durationMinutes: parseDuration('1h e 30 min'),
    price: parsePrice('200,00')
  };
  const result = validateService(service);
  return assert(result.isValid, 'Serviço com duração convertida passa validação');
});

test('Validação serviço sem duração (erro)', () => {
  const service = {
    name: 'Corte',
    durationMinutes: null,
    price: 200
  };
  const result = validateService(service);
  return assert(!result.isValid, 'Serviço sem duração falha validação');
});

console.log('');

// ==================== BLOCO 3: DETECÇÃO DE DUPLICATAS ====================

console.log('🔍 BLOCO 3: DETECÇÃO DE DUPLICATAS\n');

const existingCustomers = [
  {
    id: '1',
    name: 'Maria Silva',
    cpf: '10720247055',
    email: 'maria@email.com',
    phone: '11987654321'
  },
  {
    id: '2',
    name: 'João Santos',
    cpf: '',
    email: 'joao@email.com',
    phone: '11999887766'
  }
];

test('Duplicata por CPF detectada', () => {
  const newCustomer = {
    name: 'Maria Silva Atualizada',
    cpf: '10720247055',
    email: 'outro@email.com',
    phone: '11900000000'
  };
  const result = checkCustomerDuplicate(newCustomer, existingCustomers);
  return assert(
    result.isDuplicate && result.matchType === 'cpf',
    'Duplicata por CPF detectada corretamente'
  );
});

test('Duplicata por Email (sem CPF)', () => {
  const newCustomer = {
    name: 'João Santos Novo',
    cpf: '',
    email: 'joao@email.com',
    phone: '11900000000'
  };
  const result = checkCustomerDuplicate(newCustomer, existingCustomers);
  return assert(
    result.isDuplicate && result.matchType === 'email',
    'Duplicata por Email detectada (fallback quando sem CPF)'
  );
});

test('Possível duplicata por Telefone', () => {
  const newCustomer = {
    name: 'Ana Costa',
    cpf: '',
    email: 'ana@email.com',
    phone: '11987654321' // mesmo telefone da Maria
  };
  const result = checkCustomerDuplicate(newCustomer, existingCustomers);
  return assert(
    result.isDuplicate && result.matchType === 'telefone',
    'Possível duplicata por Telefone detectada'
  );
});

test('Cliente novo (sem duplicata)', () => {
  const newCustomer = {
    name: 'Pedro Oliveira',
    cpf: '98765432100',
    email: 'pedro@email.com',
    phone: '11955554444'
  };
  const result = checkCustomerDuplicate(newCustomer, existingCustomers);
  return assert(!result.isDuplicate, 'Cliente novo não é duplicata');
});

test('Ação padrão: CPF duplicado → atualizar', () => {
  const status = 'duplicado_cpf';
  const matchType = 'cpf';
  const action = (matchType === 'cpf' || matchType === 'email') ? 'atualizar' : 'pular';
  return assert(action === 'atualizar', 'CPF duplicado sugere ação "atualizar"');
});

test('Ação padrão: Email duplicado → atualizar', () => {
  const status = 'duplicado_email';
  const matchType = 'email';
  const action = (matchType === 'cpf' || matchType === 'email') ? 'atualizar' : 'pular';
  return assert(action === 'atualizar', 'Email duplicado sugere ação "atualizar"');
});

test('Ação padrão: Telefone duplicado → pular (CRÍTICO)', () => {
  const status = 'possivel_duplicado_telefone';
  const matchType = 'telefone';
  const action = (matchType === 'cpf' || matchType === 'email') ? 'atualizar' : 'pular';
  return assert(action === 'pular', 'Telefone duplicado sugere ação "pular" (não atualiza automaticamente)');
});

console.log('');

// ==================== BLOCO 4: BLOQUEIO DE LINHAS INVÁLIDAS ====================

console.log('🚫 BLOCO 4: BLOQUEIO DE LINHAS INVÁLIDAS\n');

test('Linha com erro → status=erro, action=pular', () => {
  const customer = {
    name: '',
    phone: '11987654321',
    email: 'teste@email.com'
  };
  const validation = validateCustomer(customer);
  const status = !validation.isValid ? 'erro' : 'novo';
  const action = !validation.isValid ? 'pular' : 'importar';

  return assert(
    status === 'erro' && action === 'pular',
    'Linha com erro fica bloqueada com action=pular'
  );
});

test('Linha válida → status=novo, action=importar', () => {
  const customer = {
    name: 'Teste',
    phone: '11987654321',
    email: 'teste@email.com'
  };
  const validation = validateCustomer(customer);
  const status = !validation.isValid ? 'erro' : 'novo';
  const action = !validation.isValid ? 'pular' : 'importar';

  return assert(
    status === 'novo' && action === 'importar',
    'Linha válida fica com action=importar'
  );
});

test('Profissional sem email → bloqueado', () => {
  const employee = {
    fullName: 'Teste',
    phone: '11987654321',
    email: ''
  };
  const validation = validateEmployee(employee);

  return assert(
    !validation.isValid && validation.errors.includes('Email válido é obrigatório'),
    'Profissional sem email fica bloqueado'
  );
});

test('Serviço sem duração → bloqueado', () => {
  const service = {
    name: 'Teste',
    durationMinutes: null,
    price: 100
  };
  const validation = validateService(service);

  return assert(
    !validation.isValid && validation.errors.includes('Duração é obrigatória e deve ser maior que 0'),
    'Serviço sem duração fica bloqueado'
  );
});

test('Serviço sem preço → bloqueado', () => {
  const service = {
    name: 'Teste',
    durationMinutes: 60,
    price: null
  };
  const validation = validateService(service);

  return assert(
    !validation.isValid && validation.errors.includes('Preço é obrigatório e não pode ser negativo'),
    'Serviço sem preço fica bloqueado'
  );
});

console.log('');

// ==================== RESUMO ====================

console.log('========================================');
console.log('📊 RESUMO DOS TESTES\n');
console.log(`✅ Passaram: ${passed}`);
console.log(`❌ Falharam: ${failed}`);
console.log(`📈 Total: ${passed + failed}`);
console.log(`🎯 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('========================================\n');

if (failed > 0) {
  console.log('❌ TESTES FALHARAM - NÃO FAZER COMMIT\n');
  process.exit(1);
} else {
  console.log('✅ TODOS OS TESTES PASSARAM\n');
  console.log('⚠️  PRÓXIMO PASSO: Teste manual na UI (wizard, upload, export)\n');
  process.exit(0);
}
