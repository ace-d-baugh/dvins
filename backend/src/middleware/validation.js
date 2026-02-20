const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = errors.array();
      return next(error);
    }
    
    next();
  };
};

const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Must be a valid email address');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character');

const validatePasswordConfirmation = (req, res, next) => {
  if (req.body.password !== req.body.password_confirmation) {
    const error = new Error('Passwords do not match');
    error.name = 'ValidationError';
    error.errors = [{ msg: 'Passwords do not match' }];
    return next(error);
  }
  next();
};

const validateWaitMinutes = body('wait_minutes')
  .optional()
  .isInt({ min: 0, max: 300 })
  .withMessage('Wait time must be between 0 and 300 minutes');

const validateThresholdMinutes = body('threshold_minutes')
  .optional()
  .isInt({ min: 0, max: 300 })
  .withMessage('Threshold must be between 0 and 300 minutes');

module.exports = {
  validate,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateWaitMinutes,
  validateThresholdMinutes,
  errorHandler
};
