/**
 * Passing a Validator by name
 * Validator must exist with this name in the base libary
 * or through custom extensions
 */

//$('#fname').validatedInput({
//  validator: 'fname'
//});

/**
 * Passing a custom validator
 */

$('#dob').validatedInput({
  validator: {
    maxlength: 2,
    rules: [
      {
        type: 'restriction',
        note: 'Enter a number between 1 and 12',
        func: function(val) {
          return (val >= 1 && val <= 12);
        }
      },
    ]
  }
});