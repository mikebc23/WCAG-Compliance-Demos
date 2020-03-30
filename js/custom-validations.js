// Example: Add new validations or overriding existing validations
$.extend(window.validations, {

  fname: {
    autocapitalize: true,
    maxlength: 15,
    rules: [
      {
        note: 'Enter only letters, hyphens, spaces, commas, periods and apostrophes',
        regx: /^[A-Za-z\-\s\.]+$/,
        minTestLen: 1
      },
    ]
  },

  mname: {
    autocapitalize: true,
    maxlength: 1,
    rules: [
      {
        note: 'Enter only letters, hyphens, spaces, commas, periods and apostrophes',
        regx: /^[A-Za-z\-\s\.]+$/,
        minTestLen: 1
      },
    ]
  },

  lname: {
    autocapitalize: true,
    maxlength: 25,
    rules: [
      {
        note: 'Enter only letters, hyphens, spaces, commas, periods and apostrophes',
        regx: /^[A-Za-z\-\s\.]+$/,
        minTestLen: 1
      },
    ]
  },

  street: {
    maxlength: 30,
    rules: [
      {
        note: 'If you are a Student, please enter your Home Address, <strong>not your School Address</strong>.'
      },
      {
        note: 'You can enter your School Address <strong>on the next page</strong>.'
      },
      {
        note: 'Enter only letters, numbers, hyphens, spaces, commas, periods and apostrophes',
        regx: /^[A-Za-z0-9\-\s,\.']+$/,
        minTestLen: 1
      }
    ]
  },

  apt: {
    maxlength: 30,
    placeholder: 'eg. Apt 15B',
    rules: [
      {
        note: 'Enter only letters, numbers, hyphens, spaces, commas, periods and apostrophes',
        regx: /^[A-Za-z0-9\-\s\.#]+$/,
        minTestLen: 1
      }
    ]
  },

  city: {
    maxlength: 20,
    rules: [
      {
        note: 'Enter only letters, hyphens, spaces, commas, periods and apostrophes',
        regx: /^[A-Za-z\-\s\.]+$/,
        minTestLen: 1
      }
    ]
  }

});