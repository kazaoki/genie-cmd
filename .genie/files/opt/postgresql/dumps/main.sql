
CREATE TABLE admin (
    seq integer NOT NULL,
    id character varying(64) NOT NULL,
    pw character varying(64) NOT NULL
);

COPY admin (seq, id, pw) FROM stdin;
1	admin	123456
\.
