/**
 * Marketplace Product Questions & Answers Routes
 * API endpoints for Q&A on product listings
 */

const express = require('express');
const { param, query, body } = require('express-validator');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * GET /api/marketplace/listings/:listingId/questions
 * Get all questions and answers for a listing
 */
router.get('/listings/:listingId/questions',
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get questions with answers
    const result = await db.query(`
      SELECT
        lq.id as question_id,
        lq.question_text,
        lq.created_at as question_created_at,
        asker.id as asker_id,
        asker.username as asker_username,
        asker.first_name as asker_first_name,
        asker.avatar_url as asker_avatar,
        json_agg(
          json_build_object(
            'answer_id', la.id,
            'answer_text', la.answer_text,
            'is_seller', la.is_seller,
            'answerer_id', answerer.id,
            'answerer_username', answerer.username,
            'answerer_first_name', answerer.first_name,
            'answerer_avatar', answerer.avatar_url,
            'created_at', la.created_at
          ) ORDER BY la.created_at ASC
        ) FILTER (WHERE la.id IS NOT NULL) as answers,
        COUNT(*) OVER() as total_count
      FROM listing_questions lq
      LEFT JOIN users asker ON lq.asker_id = asker.id
      LEFT JOIN listing_answers la ON lq.id = la.question_id
      LEFT JOIN users answerer ON la.answerer_id = answerer.id
      WHERE lq.listing_id = $1
      GROUP BY lq.id, asker.id
      ORDER BY lq.created_at DESC
      LIMIT $2 OFFSET $3
    `, [listingId, limit, offset]);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    res.json({
      success: true,
      data: {
        questions: result.rows,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * POST /api/marketplace/listings/:listingId/questions
 * Ask a question about a listing
 */
router.post('/listings/:listingId/questions',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    body('question_text')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Question must be between 5 and 1000 characters'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const { listingId } = req.params;
    const { question_text } = req.body;
    const userId = req.user.userId || req.user.id;

    // Verify listing exists
    const listingCheck = await db.query(
      'SELECT id FROM marketplace_listings WHERE id = $1',
      [listingId]
    );

    if (listingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Insert question
    const result = await db.query(`
      INSERT INTO listing_questions (listing_id, asker_id, question_text)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [listingId, userId, question_text.trim()]);

    // Get question with user details
    const questionResult = await db.query(`
      SELECT
        lq.*,
        u.username as asker_username,
        u.first_name as asker_first_name,
        u.avatar_url as asker_avatar
      FROM listing_questions lq
      LEFT JOIN users u ON lq.asker_id = u.id
      WHERE lq.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      data: questionResult.rows[0]
    });
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post question'
    });
  }
});

/**
 * POST /api/marketplace/questions/:questionId/answers
 * Answer a question
 */
router.post('/questions/:questionId/answers',
  authenticate,
  [
    param('questionId').isInt({ min: 1 }).withMessage('Valid question ID is required'),
    body('answer_text')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Answer must be between 1 and 1000 characters'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer_text } = req.body;
    const userId = req.user.userId || req.user.id;

    // Get question and listing details
    const questionResult = await db.query(`
      SELECT lq.*, ml.user_id as seller_id
      FROM listing_questions lq
      LEFT JOIN marketplace_listings ml ON lq.listing_id = ml.id
      WHERE lq.id = $1
    `, [questionId]);

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    const question = questionResult.rows[0];
    const isSeller = userId === question.seller_id;

    // Insert answer
    const result = await db.query(`
      INSERT INTO listing_answers (question_id, answerer_id, answer_text, is_seller)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [questionId, userId, answer_text.trim(), isSeller]);

    // Get answer with user details
    const answerResult = await db.query(`
      SELECT
        la.*,
        u.username as answerer_username,
        u.first_name as answerer_first_name,
        u.avatar_url as answerer_avatar
      FROM listing_answers la
      LEFT JOIN users u ON la.answerer_id = u.id
      WHERE la.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      data: answerResult.rows[0]
    });
  } catch (error) {
    console.error('Error posting answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post answer'
    });
  }
});

module.exports = router;
