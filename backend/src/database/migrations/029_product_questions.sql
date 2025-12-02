-- Migration 029: Product Questions & Answers
-- Adds Q&A functionality for marketplace listings

CREATE TABLE IF NOT EXISTS listing_questions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  asker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT question_text_length CHECK (char_length(question_text) >= 5 AND char_length(question_text) <= 1000)
);

CREATE TABLE IF NOT EXISTS listing_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES listing_questions(id) ON DELETE CASCADE,
  answerer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT answer_text_length CHECK (char_length(answer_text) >= 1 AND char_length(answer_text) <= 1000)
);

-- Indexes for performance
CREATE INDEX idx_listing_questions_listing_id ON listing_questions(listing_id);
CREATE INDEX idx_listing_questions_asker_id ON listing_questions(asker_id);
CREATE INDEX idx_listing_questions_created_at ON listing_questions(created_at DESC);

CREATE INDEX idx_listing_answers_question_id ON listing_answers(question_id);
CREATE INDEX idx_listing_answers_answerer_id ON listing_answers(answerer_id);
CREATE INDEX idx_listing_answers_created_at ON listing_answers(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_listing_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_listing_questions_updated_at
  BEFORE UPDATE ON listing_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_questions_updated_at();

CREATE OR REPLACE FUNCTION update_listing_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_listing_answers_updated_at
  BEFORE UPDATE ON listing_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_answers_updated_at();
