const validate = (schema) => (req, res, next) => {
  try {
    // For cases like patient registration with photo (FormData), 
    // address might be nested differently or flattened.
    // We'll handle both based on how the frontend sends it.
    
    let dataToValidate = req.body;
    
    // If address fields are flattened in body (common with FormData/Multer), reconstruct address object
    if (req.body.addressStreet && !req.body.address) {
      dataToValidate = {
        ...req.body,
        address: {
          street: req.body.addressStreet,
          taluk: req.body.addressTaluk,
          district: req.body.addressDistrict,
          state: req.body.addressState,
          pincode: req.body.addressPincode
        }
      };
    }

    const validatedData = schema.parse(dataToValidate);
    // Update req.body with validated/transformed data so subsequent handlers see it
    req.body = validatedData;
    next();
  } catch (error) {
    if (error.name === 'ZodError' || error.errors) {
      try {
        const errorMessages = (error.errors || []).map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : 'unknown',
          message: err.message
        }));
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
      } catch (mappingError) {
        return next(error);
      }
    }
    next(error);
  }
};

module.exports = validate;
