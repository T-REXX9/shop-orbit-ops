/**
 * Contact Person Routes
 * RESTful API endpoints for customer contact person management
 */

import express from 'express';
import ContactService from '../services/ContactService.js';
import { successResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/customers/:customerId/contacts
 * Get all contacts for a customer
 */
router.get('/customers/:customerId/contacts', (req, res, next) => {
  try {
    const contacts = ContactService.getContactsByCustomer(req.params.customerId);
    logger.debug(`Retrieved ${contacts.length} contacts for customer ${req.params.customerId}`);
    res.json(successResponse(contacts, contacts.length));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/customers/:customerId/contacts
 * Create new contact for a customer
 */
router.post('/customers/:customerId/contacts', (req, res, next) => {
  try {
    const contactData = {
      ...req.body,
      customer_id: req.params.customerId
    };
    const contact = ContactService.createContact(contactData);
    logger.info(`Created contact ${contact.id} for customer ${req.params.customerId}`);
    res.status(201).json(successResponse(contact));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/contacts/:id
 * Get single contact by ID
 */
router.get('/contacts/:id', (req, res, next) => {
  try {
    const contact = ContactService.getContactWithCustomer(req.params.id);
    logger.debug(`Retrieved contact ${req.params.id}`);
    res.json(successResponse(contact));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/contacts/:id
 * Update contact
 */
router.put('/contacts/:id', (req, res, next) => {
  try {
    const contact = ContactService.updateContact(req.params.id, req.body);
    logger.info(`Updated contact ${req.params.id}`);
    res.json(successResponse(contact));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/contacts/:id
 * Delete contact
 */
router.delete('/contacts/:id', (req, res, next) => {
  try {
    ContactService.deleteContact(req.params.id);
    logger.info(`Deleted contact ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/contacts/search
 * Search contacts
 */
router.get('/contacts/search', (req, res, next) => {
  try {
    const { q, customer_id } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query (q) is required' });
    }

    const contacts = ContactService.searchContacts(q, customer_id);
    logger.debug(`Search returned ${contacts.length} contacts`);
    res.json(successResponse(contacts, contacts.length));
  } catch (error) {
    next(error);
  }
});

export default router;
