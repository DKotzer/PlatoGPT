--  RUN 1st
create extension vector;

-- RUN 2nd - changed everything to pg2 to not conflict with pg
create table pg2 (
  id bigserial primary key,
  essay_title text,
  essay_url text,
  essay_date text,
  essay_category text,
  content text,
  content_length bigint,
  content_tokens bigint,
  embedding vector (1536)
);

-- RUN 3rd after running the scripts
create or replace function pg2_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  essay_title text,
  essay_url text,
  essay_date text,
  essay_category text,
  content text,
  content_length bigint,
  content_tokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    pg2.id,
    pg2.essay_title,
    pg2.essay_url,
    pg2.essay_date,
    pg2.essay_category,
    pg2.content,
    pg2.content_length,
    pg2.content_tokens,
    1 - (pg2.embedding <=> query_embedding) as similarity
  from pg2
  where 1 - (pg2.embedding <=> query_embedding) > similarity_threshold
  order by pg2.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on pg2 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);





-- //for blogs scraping, after running the scraper , find all <content":"Anne Hussain> (remove arrow brackets)  and replace with content:"" , then do the same for content":"Anne

-- Create a table to store the history of questions and answers
create table qa_history (
  id bigserial primary key,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default current_timestamp
);

-- Create a function to insert a new question and answer into the qa_history table
create or replace function insert_qa_history (
  p_question text,
  p_answer text
)
returns void
language plpgsql
as $$
begin
  insert into qa_history (question, answer)
  values (p_question, p_answer);
end;
$$;

