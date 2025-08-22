-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'manager');

-- Create communication_channel enum
CREATE TYPE public.communication_channel AS ENUM ('whatsapp_business', 'evolution_api', 'instagram', 'facebook_messenger', 'webchat', 'email', 'phone');

-- Create message_status enum
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read', 'failed');

-- Create session_status enum
CREATE TYPE public.session_status AS ENUM ('active', 'closed', 'pending');

-- Create profiles table for system users (agents, admins)
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role app_role NOT NULL DEFAULT 'agent',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    industry TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    company_id UUID REFERENCES public.companies(id),
    google_contact_id TEXT,
    tags TEXT[],
    notes TEXT,
    status TEXT DEFAULT 'active',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table for communication sessions
CREATE TABLE public.sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(id),
    channel communication_channel NOT NULL,
    channel_specific_id TEXT, -- WhatsApp number, Instagram handle, etc.
    status session_status NOT NULL DEFAULT 'pending',
    title TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id), -- NULL if message from client
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, image, file, etc.
    media_url TEXT,
    status message_status DEFAULT 'sent',
    is_from_client BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quick_replies table
CREATE TABLE public.quick_replies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    is_global BOOLEAN DEFAULT false, -- true if available to all agents
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mass_messages table for bulk messaging campaigns
CREATE TABLE public.mass_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    channel communication_channel NOT NULL,
    target_tags TEXT[], -- tags to filter clients
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mass_message_recipients table
CREATE TABLE public.mass_message_recipients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mass_message_id UUID NOT NULL REFERENCES public.mass_messages(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    status message_status DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table for tracking tasks and activities
CREATE TABLE public.activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL, -- call, email, meeting, task, note
    client_id UUID REFERENCES public.clients(id),
    assigned_to UUID NOT NULL REFERENCES public.profiles(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = _role;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() IN ('admin', 'manager');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Only admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Only admins can delete profiles" ON public.profiles
    FOR DELETE USING (public.has_role('admin'));

-- RLS Policies for companies table
CREATE POLICY "All users can view companies" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "All users can create companies" ON public.companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update companies they created or admins" ON public.companies
    FOR UPDATE USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR public.is_admin_or_manager());

CREATE POLICY "Only admins can delete companies" ON public.companies
    FOR DELETE USING (public.has_role('admin'));

-- RLS Policies for clients table
CREATE POLICY "All users can view clients" ON public.clients
    FOR SELECT USING (true);

CREATE POLICY "All users can create clients" ON public.clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their assigned clients or admins" ON public.clients
    FOR UPDATE USING (
        assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
        OR created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "Only admins can delete clients" ON public.clients
    FOR DELETE USING (public.has_role('admin'));

-- RLS Policies for sessions table
CREATE POLICY "Users can view sessions they're involved in" ON public.sessions
    FOR SELECT USING (
        agent_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "All users can create sessions" ON public.sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents can update their sessions or admins" ON public.sessions
    FOR UPDATE USING (
        agent_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "Only admins can delete sessions" ON public.sessions
    FOR DELETE USING (public.has_role('admin'));

-- RLS Policies for messages table
CREATE POLICY "Users can view messages from their sessions" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sessions s 
            WHERE s.id = session_id 
            AND (s.agent_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR public.is_admin_or_manager())
        )
    );

CREATE POLICY "All users can create messages" ON public.messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (
        sender_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "Only admins can delete messages" ON public.messages
    FOR DELETE USING (public.has_role('admin'));

-- RLS Policies for quick_replies table
CREATE POLICY "Users can view global quick replies and their own" ON public.quick_replies
    FOR SELECT USING (
        is_global = true 
        OR created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "All users can create quick replies" ON public.quick_replies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own quick replies or admins can update all" ON public.quick_replies
    FOR UPDATE USING (
        created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "Users can delete their own quick replies or admins can delete all" ON public.quick_replies
    FOR DELETE USING (
        created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

-- RLS Policies for mass_messages table
CREATE POLICY "Users can view mass messages they created or admins view all" ON public.mass_messages
    FOR SELECT USING (
        created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "All users can create mass messages" ON public.mass_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their mass messages or admins" ON public.mass_messages
    FOR UPDATE USING (
        created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "Users can delete their mass messages or admins" ON public.mass_messages
    FOR DELETE USING (
        created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

-- RLS Policies for mass_message_recipients table
CREATE POLICY "Users can view recipients of their mass messages" ON public.mass_message_recipients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.mass_messages mm 
            WHERE mm.id = mass_message_id 
            AND (mm.created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR public.is_admin_or_manager())
        )
    );

CREATE POLICY "System can insert mass message recipients" ON public.mass_message_recipients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update mass message recipients" ON public.mass_message_recipients
    FOR UPDATE USING (true);

-- RLS Policies for activities table
CREATE POLICY "Users can view activities assigned to them or created by them" ON public.activities
    FOR SELECT USING (
        assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "All users can create activities" ON public.activities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update activities assigned to them" ON public.activities
    FOR UPDATE USING (
        assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

CREATE POLICY "Users can delete activities they created or admins" ON public.activities
    FOR DELETE USING (
        created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR public.is_admin_or_manager()
    );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quick_replies_updated_at
    BEFORE UPDATE ON public.quick_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mass_messages_updated_at
    BEFORE UPDATE ON public.mass_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
        'agent'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_clients_assigned_to ON public.clients(assigned_to);
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_clients_tags ON public.clients USING GIN(tags);
CREATE INDEX idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX idx_sessions_agent_id ON public.sessions(agent_id);
CREATE INDEX idx_sessions_channel ON public.sessions(channel);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_activities_assigned_to ON public.activities(assigned_to);
CREATE INDEX idx_activities_client_id ON public.activities(client_id);
CREATE INDEX idx_activities_due_date ON public.activities(due_date);
CREATE INDEX idx_mass_messages_created_by ON public.mass_messages(created_by);
CREATE INDEX idx_mass_message_recipients_mass_message_id ON public.mass_message_recipients(mass_message_id);