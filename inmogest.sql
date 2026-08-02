-- inmogest.sql - Schema InmoGest 2.0 (completo, con IF NOT EXISTS)

-- PROPIETARIOS (ya la tenías creada)
CREATE TABLE IF NOT EXISTS propietarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROPIEDADES (ya la tenías creada)
CREATE TABLE IF NOT EXISTS propiedades (
  id BIGSERIAL PRIMARY KEY,
  propietario_id BIGINT REFERENCES propietarios(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  alquiler NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INQUILINOS
CREATE TABLE IF NOT EXISTS inquilinos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CONTRATOS
CREATE TABLE IF NOT EXISTS contratos (
  id BIGSERIAL PRIMARY KEY,
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  inquilino_id BIGINT REFERENCES inquilinos(id) ON DELETE CASCADE,
  alquiler NUMERIC NOT NULL DEFAULT 0,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado TEXT DEFAULT 'Vigente',
  created_at TIMESTAMP DEFAULT NOW()
);

-- IMPUESTOS
CREATE TABLE IF NOT EXISTS impuestos (
  id BIGSERIAL PRIMARY KEY,
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  importe NUMERIC NOT NULL DEFAULT 0,
  pagador TEXT DEFAULT 'Inquilino',
  periodo TEXT DEFAULT 'Mensual',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SERVICIOS
CREATE TABLE IF NOT EXISTS servicios (
  id BIGSERIAL PRIMARY KEY,
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  importe NUMERIC NOT NULL DEFAULT 0,
  pagador TEXT DEFAULT 'Inquilino',
  periodo TEXT DEFAULT 'Mensual',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- COBRANZAS
CREATE TABLE IF NOT EXISTS cobranzas (
  id BIGSERIAL PRIMARY KEY,
  contrato_id BIGINT REFERENCES contratos(id) ON DELETE CASCADE,
  contrato TEXT,
  alquiler NUMERIC DEFAULT 0,
  impuestos NUMERIC DEFAULT 0,
  servicios NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  estado TEXT DEFAULT 'Pendiente',
  fecha_vencimiento DATE,
  fecha_pago DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LIQUIDACIONES
CREATE TABLE IF NOT EXISTS liquidaciones (
  id BIGSERIAL PRIMARY KEY,
  contrato_id BIGINT REFERENCES contratos(id) ON DELETE CASCADE,
  alquiler NUMERIC DEFAULT 0,
  comision NUMERIC DEFAULT 0,
  gastos NUMERIC DEFAULT 0,
  impuestos_transferidos NUMERIC DEFAULT 0,
  neto NUMERIC DEFAULT 0,
  estado TEXT DEFAULT 'Pendiente',
  fecha DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security: habilitado en todas, con política abierta para
-- desarrollo (solo vos usás la app por ahora, sin login). Cuando agregues
-- autenticación de usuarios, hay que reemplazar estas políticas por unas
-- que filtren por auth.uid().
ALTER TABLE propietarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquilinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE impuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobranzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidaciones ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['propietarios','propiedades','inquilinos','contratos','impuestos','servicios','cobranzas','liquidaciones']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "acceso_total_%1$s" ON %1$s', t);
    EXECUTE format('CREATE POLICY "acceso_total_%1$s" ON %1$s FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
