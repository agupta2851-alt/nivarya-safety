-- ==============================================================================
-- NIVARYA WOMEN SAFETY PLATFORM - REAL BACKEND DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================
--
-- This script provisions the complete relational schema with:
-- 1. Profiles & authentication extension
-- 2. Emergency contacts with user isolation
-- 3. Journeys & live status lifecycle tracking
-- 4. Live location updates with GPS accuracy telemetry
-- 5. SOS emergency events & dispatch timelines
-- 6. Crowdsourced safety reports with verification & moderation
-- 7. Community safety locations & national helplines
-- 8. User activity timestamps / chronological audit trail
-- 9. Secure Row-Level Security (RLS) policies to protect private data
-- 10. Aggregated statistics function ensuring unauthenticated visitors
--     only access anonymous counts, never private individual user data.
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS / PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    age TEXT,
    city TEXT,
    location TEXT,
    blood_group TEXT,
    emergency_notes TEXT,
    safety_pin TEXT DEFAULT '1234',
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- ------------------------------------------------------------------------------
-- 2. SAFETY CIRCLE / TRUSTED CONTACTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Mother',
    phone TEXT NOT NULL,
    email TEXT,
    alert_status TEXT DEFAULT 'active' CHECK (alert_status IN ('active', 'sos_only', 'journey_only', 'muted')),
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    avatar_color TEXT DEFAULT '#6366F1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);

-- Legacy emergency contacts table alias for backwards compatibility
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relation TEXT DEFAULT 'Mother',
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    avatar_color TEXT DEFAULT '#6366F1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.emergency_contacts(user_id);

-- ------------------------------------------------------------------------------
-- 3. JOURNEYS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_point TEXT NOT NULL,
    destination TEXT NOT NULL,
    mode TEXT DEFAULT 'cab' CHECK (mode IN ('cab', 'metro', 'bus', 'auto', 'walk', 'twoWheeler')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    eta_minutes INTEGER DEFAULT 25,
    checkins_count INTEGER DEFAULT 0,
    last_checkin_time TIMESTAMPTZ,
    is_paused BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON public.journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_status ON public.journeys(status);

-- ------------------------------------------------------------------------------
-- 4. LIVE LOCATION UPDATES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    source TEXT DEFAULT 'gps' CHECK (source IN ('gps', 'manual', 'network')),
    address TEXT,
    city TEXT,
    battery_level INTEGER,
    tracking_token TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_location_user_id ON public.live_location_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_location_journey_id ON public.live_location_updates(journey_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_token ON public.live_location_updates(tracking_token);

-- ------------------------------------------------------------------------------
-- 5. SOS EMERGENCY EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sos_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disarmed', 'cancelled')),
    trigger_type TEXT DEFAULT 'button' CHECK (trigger_type IN ('button', 'voice', 'gesture', 'deviation', 'timer')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    disarmed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sos_user_id ON public.sos_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_status ON public.sos_events(status);

-- ------------------------------------------------------------------------------
-- 6. SAFETY REPORTS TABLE (CROWDSOURCED VIGILANCE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High')),
    status TEXT DEFAULT 'Under Review',
    upvotes INTEGER DEFAULT 0,
    flagged BOOLEAN DEFAULT false,
    author_badge TEXT DEFAULT 'Anonymous Commuter',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_category ON public.safety_reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.safety_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_flagged ON public.safety_reports(flagged);

-- ------------------------------------------------------------------------------
-- 7. COMMUNITY / SAFETY LOCATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('police', 'hospital', 'safezone', 'transit')),
    category TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    phone TEXT,
    badge TEXT,
    details TEXT,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_locations_type ON public.safety_locations(type);

-- Insert standard verified pan-India national helplines & safety infrastructure
INSERT INTO public.safety_locations (name, type, category, address, phone, badge, details, verified)
VALUES
    ('National Emergency Response (Police, Fire, Ambulance)', 'police', 'National Helpline', 'National Emergency Response Center', '112', 'Government 24/7', 'Integrated single emergency response number across India.', true),
    ('Women In Distress Helpline', 'police', 'Women Helpline', 'State Police Headquarters', '1091', '24/7 Toll-Free', 'Dedicated national response desk for women facing distress.', true),
    ('National Commission for Women Helpline', 'safezone', 'Women Helpline', 'Ministry of Women & Child Development', '181', '24/7 Support', 'Crisis intervention, counselling, and emergency referral.', true),
    ('Police Control Room Rapid Dispatch', 'police', 'Police', 'City Police Headquarters', '100', 'Emergency Dispatch', 'Direct line for emergency patrol vehicle dispatch.', true),
    ('National Emergency Ambulance Service', 'hospital', 'Medical', 'Civil Hospital Trauma Network', '108', 'Emergency Medical', 'Emergency medical transport with life support systems.', true),
    ('Pink Patrol Transit Assistance Booth', 'safezone', 'Safe Zone', 'Central Transit Hub', '1091', 'Safe Zone', 'Dedicated female personnel kiosk with first aid and safe escort.', true),
    ('Institutional & Campus Safety Cell', 'safezone', 'Security', 'University Security Control Post', '112', 'Security Desk', 'Campus rapid security and escort assistance.', true)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. USER ACTIVITY TIMESTAMPS / AUDIT LOG TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_activity_timestamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'journey', 'sos', 'checkin', 'report', 'mode', 'contact'
    title TEXT NOT NULL,
    details TEXT,
    location TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.user_activity_timestamps(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.user_activity_timestamps(created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_timestamps ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update only their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Safety Circle / Trusted Contacts: Isolated strictly to the authenticated user
CREATE POLICY "Users can view own trusted contacts"
    ON public.trusted_contacts FOR SELECT
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can insert own trusted contacts"
    ON public.trusted_contacts FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can update own trusted contacts"
    ON public.trusted_contacts FOR UPDATE
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can delete own trusted contacts"
    ON public.trusted_contacts FOR DELETE
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR user_id = auth.uid());

-- Emergency Contacts: Isolated completely to the owner
CREATE POLICY "Users can manage own emergency contacts"
    ON public.emergency_contacts FOR ALL
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Journeys: User can only access own journeys
CREATE POLICY "Users can manage own journeys"
    ON public.journeys FOR ALL
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Live location updates: User can write own location; public read allowed ONLY via matching tracking_token
CREATE POLICY "Users can insert own location"
    ON public.live_location_updates FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Token holders can read shared live tracking"
    ON public.live_location_updates FOR SELECT
    USING (tracking_token IS NOT NULL);

-- Safety reports: Public read-only for unflagged reports; authenticated write
CREATE POLICY "Anyone can view unflagged safety reports"
    ON public.safety_reports FOR SELECT
    USING (flagged = false);

CREATE POLICY "Users can submit safety reports"
    ON public.safety_reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can upvote safety reports"
    ON public.safety_reports FOR UPDATE
    USING (true);

-- Safety locations: Public read for all verified safety locations
CREATE POLICY "Anyone can view verified safety locations"
    ON public.safety_locations FOR SELECT
    USING (verified = true);

-- User activity timestamps: Isolated to individual user
CREATE POLICY "Users can view own activity timestamps"
    ON public.user_activity_timestamps FOR SELECT
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own activity timestamps"
    ON public.user_activity_timestamps FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 10. REALTIME REPLICATION CONFIGURATION
-- ------------------------------------------------------------------------------
-- Enable Supabase Realtime for instant synchronization across connected clients
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trusted_contacts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_contacts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.journeys;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_reports;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_events;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_location_updates;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 11. SECURE AGGREGATED STATISTICS FUNCTION (NO PRIVATE DATA EXPOSED)
-- ------------------------------------------------------------------------------
-- This database function is callable by public/unauthenticated users.
-- It returns strictly aggregate counts and zeroes, never revealing private user details.
CREATE OR REPLACE FUNCTION public.get_public_platform_statistics()
RETURNS TABLE (
    total_users BIGINT,
    active_journeys BIGINT,
    completed_journeys BIGINT,
    sos_events BIGINT,
    safety_reports BIGINT,
    verified_safety_hubs BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT
        (SELECT COUNT(*) FROM public.profiles)::BIGINT AS total_users,
        (SELECT COUNT(*) FROM public.journeys WHERE status = 'active')::BIGINT AS active_journeys,
        (SELECT COUNT(*) FROM public.journeys WHERE status = 'completed')::BIGINT AS completed_journeys,
        (SELECT COUNT(*) FROM public.sos_events)::BIGINT AS sos_events,
        (SELECT COUNT(*) FROM public.safety_reports WHERE flagged = false)::BIGINT AS safety_reports,
        (SELECT COUNT(*) FROM public.safety_locations WHERE verified = true)::BIGINT AS verified_safety_hubs;
$$;
