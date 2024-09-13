--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Ubuntu 16.4-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.4 (Ubuntu 16.4-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: websitevisitors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.websitevisitors (
    sessionid text NOT NULL,
    email text,
    website text,
    companyname text,
    mylistingurl text
);


ALTER TABLE public.websitevisitors OWNER TO postgres;

--
-- Name: websitevisitors websitevisitors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websitevisitors
    ADD CONSTRAINT websitevisitors_pkey PRIMARY KEY (sessionid);


--
-- PostgreSQL database dump complete
--

