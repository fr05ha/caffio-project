--
-- PostgreSQL database dump
--

\restrict CiWCpD5YGtbjaunatZGQFqZb0PfpJAWNkVhcvSRCZ2XgrmSicfkG0mhpQ1lGIZ4

-- Dumped from database version 18.0 (Postgres.app)
-- Dumped by pg_dump version 18.0 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cafes; Type: TABLE; Schema: public; Owner: mikkey_frolkin
--

CREATE TABLE public.cafes (
    id integer NOT NULL,
    name text NOT NULL,
    address text,
    lat double precision NOT NULL,
    lon double precision NOT NULL,
    rating_avg numeric(3,2) DEFAULT 0,
    rating_count integer DEFAULT 0,
    is_certified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cafes OWNER TO mikkey_frolkin;

--
-- Name: cafes_id_seq; Type: SEQUENCE; Schema: public; Owner: mikkey_frolkin
--

CREATE SEQUENCE public.cafes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafes_id_seq OWNER TO mikkey_frolkin;

--
-- Name: cafes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mikkey_frolkin
--

ALTER SEQUENCE public.cafes_id_seq OWNED BY public.cafes.id;


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: mikkey_frolkin
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    menu_id integer,
    name text NOT NULL,
    description text,
    price numeric(6,2),
    currency character(3) DEFAULT 'AUD'::bpchar
);


ALTER TABLE public.menu_items OWNER TO mikkey_frolkin;

--
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: mikkey_frolkin
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO mikkey_frolkin;

--
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mikkey_frolkin
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: mikkey_frolkin
--

CREATE TABLE public.menus (
    id integer NOT NULL,
    cafe_id integer,
    name text DEFAULT 'Main'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.menus OWNER TO mikkey_frolkin;

--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: public; Owner: mikkey_frolkin
--

CREATE SEQUENCE public.menus_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menus_id_seq OWNER TO mikkey_frolkin;

--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mikkey_frolkin
--

ALTER SEQUENCE public.menus_id_seq OWNED BY public.menus.id;


--
-- Name: cafes id; Type: DEFAULT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.cafes ALTER COLUMN id SET DEFAULT nextval('public.cafes_id_seq'::regclass);


--
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- Name: menus id; Type: DEFAULT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.menus ALTER COLUMN id SET DEFAULT nextval('public.menus_id_seq'::regclass);


--
-- Data for Name: cafes; Type: TABLE DATA; Schema: public; Owner: mikkey_frolkin
--

COPY public.cafes (id, name, address, lat, lon, rating_avg, rating_count, is_certified, created_at) FROM stdin;
1	Single O Surry Hills	60-64 Reservoir St, Surry Hills NSW	-33.882	151.209	4.70	241	t	2025-10-22 17:13:53.177943+11
2	Mecca Coffee King St	67 King St, Sydney NSW	-33.871	151.207	4.60	180	f	2025-10-22 17:13:53.177943+11
3	Reuben Hills	61 Albion St, Surry Hills NSW	-33.8847	151.2113	4.65	210	t	2025-10-22 17:13:53.177943+11
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: mikkey_frolkin
--

COPY public.menu_items (id, menu_id, name, description, price, currency) FROM stdin;
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: mikkey_frolkin
--

COPY public.menus (id, cafe_id, name, is_active, created_at) FROM stdin;
\.


--
-- Name: cafes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mikkey_frolkin
--

SELECT pg_catalog.setval('public.cafes_id_seq', 3, true);


--
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mikkey_frolkin
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 1, false);


--
-- Name: menus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mikkey_frolkin
--

SELECT pg_catalog.setval('public.menus_id_seq', 1, false);


--
-- Name: cafes cafes_pkey; Type: CONSTRAINT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.cafes
    ADD CONSTRAINT cafes_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: menus menus_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikkey_frolkin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CiWCpD5YGtbjaunatZGQFqZb0PfpJAWNkVhcvSRCZ2XgrmSicfkG0mhpQ1lGIZ4

