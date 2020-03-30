/*!
 * jQuery ADA Validation Plugin v0.3.1
 *
 * Copyright (c) 2016 MCD Partners
 * Released under the MIT license
 */
(function ($, window, document, undefined) {
  "use strict";

var DATA_VALIDATION       = 'data-validation';
var DATA_VALIDATION_LABEL = 'data-validation-label';
var DATA_VALIDATION_GROUP = 'data-validation-group';

var DATA_VALIDATE_FORM    = 'data-validate-form';
var DATA_VALIDATE_RESET   = 'data-validate-reset';

var WARNING_CLASS         = 'has-warning';
var ERROR_CLASS           = 'has-error';
var SUMMARY_CLASS         = 'error-summary';

function ariaHide($el) {
  $el.attr('aria-hidden', 'true');
}

function ariaShow($el) {
  $el.attr('aria-hidden', 'false');
}

function ariaValid($el) {
  $el.attr('aria-invalid', 'false');
}

function ariaInvalid($el) {
  $el.attr('aria-invalid', 'true');
}
var ValidatorTypes = {
  REQ: 'requirement',     // Regex must pass to be valid
  RES: 'restriction'      // Regex must fail to be valid
};

// --------------------------------------
// Validator
//

var Validator = function(options) {
  $.extend(this, options);
  this.rules = [];

  if (options && options.rules) {
    for (var i = 0; i < options.rules.length; i++) {
      this.rules[i] = new ValidatorRule(options.rules[i]);
    }
  }
};

Validator.create = function(option) {
  if (window.validations[option]) {
    return new Validator(window.validations[option]);
  } else if (typeof option === 'object') {
    return new Validator(option);
  }

  return new Validator();
};

Validator.prototype.renderNotes = function(id) {
  var html = '<div id="' + id + 'Validations" class="validations" aria-hidden="true"><ul>';

  for (var i = 0; i < this.rules.length; i++) {
    html += '<li class="' + this.rules[i].type +
            '" aria-hidden="true">' +
            this.rules[i].note + '</li>';
  }
  html += '</ul></div>';

  return html;
};

Validator.prototype.test = function(val) {
  var passes = 0;

  for (var i = 0; i < this.rules.length; i++) {
    if (this.rules[i].test(val)) {
      passes++;
    }
  }

  return (passes === this.rules.length);
};

// --------------------------------------
// ValidatorRule
//

var ValidatorRule = function(options) {
  $.extend(this, {
    type: ValidatorTypes.REQ,    // Requirement or Restriction
    note: '',                    // Error message to display
    regx: /.+/,                  // Single Regex or Array of Regexes
    all: false,                  // If an Array, all tests must pass
    minTestLen: -1,              // Number of chars before validation takes place
    help: true,                  // Help will not trigger a warning or an error
    showOnFirstFocus: true       // Show hint on first focus
  }, options);

  // Help for REQ = True by default
  // Help for RES = False by default
  if (options && options.type === ValidatorTypes.RES) {
    this.help = options.help || false;
  }
};

/**
 * For each ValidatorRule a test() is provided to see if the
 * rule passes or not.
 *
 * IMPORTANT:
 * Requirement = Regex/Function that must Pass to return True
 * Restriction = Regex/Function that must Fail to return True
 *
 * @param val         is the value of the input
 * @returns boolean   true if the test passes
 */
ValidatorRule.prototype.test = function(val) {
  var result, testsPassed = 0;

  if (typeof this.func === 'function') {
    return this.func(val);
  }

  if (this.regx.length > 1) {
    // regx is an array of expressions, all of which
    // are required to pass
    for (var i = 0; i<this.regx.length; i++) {
      if (this.regx[i].test(val)) {
        testsPassed++;
      }
    }
    if (this.all) {
      result = (testsPassed === this.regx.length);
    } else {
      result = (0 < testsPassed);
    }
  } else {
    // regex was a single expression
    result = this.regx.test(val);
  }

  return (this.type === ValidatorTypes.REQ) ? result : !result;
};
(function() {
  'use strict';

  // PUBLIC CLASS DEFINITION
  // ================================

  var ValidatedInput = function(element, options) {
    var RequiredRule;

    this.$element   = $(element);
    this.options    = $.extend({}, ValidatedInput.DEFAULTS, options);
    this.isRequired = this.$element.attr('required');
    this.validator  = Validator.create(options.validator);
    this.hasError   = false;
    this.tagName    = this.$element.prop('tagName').toLowerCase();

    if (this.isRequired) {
      RequiredRule = new Validator(validations.required);
      if (this.options.requiredNote) {
        RequiredRule.rules[0].note = this.options.requiredNote;
      }
      this.validator.rules = this.validator.rules.concat(RequiredRule.rules);
    }

    this.addListeners();
    this.configureInput();
  };

  ValidatedInput.VERSION  = '0.3.1';

  ValidatedInput.DEFAULTS = {};

  ValidatedInput.prototype.addListeners = function() {
    this.$element.on('focus.validatedInput', this, onFocus);
    this.$element.on('change.validatedInput', this, onChange);
    this.$element.on('blur.validatedInput', this, onBlur);

    if (this.tagName === 'input') {
      this.$element.on('keyup.validatedInput', this, onKeyUp);
    }
  };

  ValidatedInput.prototype.removeListeners = function() {
    this.$element.off('focus.validatedInput, keyup.validatedInput, blur.validatedInput');
  };

  ValidatedInput.prototype.configureInput = function() {
    var id = this.$element.attr('id');
    var tagType = this.$element.attr('type');
    var attrs = {
        'aria-describedby': id + 'Validations'
      };
    var html;

    if (['input', 'select'].indexOf(this.tagName) === -1) {
      throw new Error('ValidatedInput cannot be applied to a ' + tagName);
    }

    if (!this.$element.attr(DATA_VALIDATION)) {
      attrs[DATA_VALIDATION] = 'true';
    }

    if (this.isRequired) {
      attrs['aria-required'] = 'true';
    }

    // Server-side validation has determined this field has an error
    if (this.$element.attr('aria-invalid') === 'true') {
      this.hasError = true;
    }

    if (this.tagName === 'input') {
      switch (tagType) {
        case 'text':
        case 'email':
        case 'tel':
        case 'password':
          $.extend(attrs, {
            'maxlength': this.validator.maxlength,
            'autocapitalize': this.validator.autocapitalize || 'off',
            'autocorrect': this.validator.autocorrect || 'off',
            'placeholder': this.validator.placeholder
          });
          break;
        case 'radio':
        case 'checkbox':
          // Nothing yet
          break;
      }
    }

    // This flag is set initally so that we know when the first time
    // a user interacts with the field is.
    attrs['data-validation-first-focus'] = 'true';

    this.$element.attr(attrs);

    html = this.validator.renderNotes(id);
    this.$element.closest('.form-group').append(html);
  };

  ValidatedInput.prototype.validate = function(isClientSideSubmit) {
    var val = this.$element.val();
    var $elGroup = this.$element.closest('.form-group');
    var rules = this.validator.rules;
    var $validations = $('#' + this.$element.attr('id') + 'Validations');
    var $hints = $validations.find('ul').children();
    var testHasPassed, theRule;
    var result = {errors: [], warnings: []};
    var isFirstTimedFocused = this.$element.data('validation-first-focus') === true;
    var isDisabled = this.$element.prop('disabled');

    var valueIsRequired = this.$element.attr('required') === 'required';
    var valueIsNotRequired = !valueIsRequired;
    var valueIsPresent = val.length > 0;
    var valueIsTooShortToTest;

    $validations.css('width', this.$element.outerWidth() + 'px');

    if (isDisabled) {
      return result;
    }

    for (var i = 0; i < rules.length; i++) {
      theRule = rules[i];
      testHasPassed = theRule.test(val);

      if (isClientSideSubmit) {
        if (testHasPassed || (!valueIsPresent && valueIsNotRequired)) {
          ariaHide($hints.eq(i));
        } else {
          this.hasError = true;
          $elGroup.addClass(ERROR_CLASS);
          ariaInvalid(this.$element);
          result.errors.push(theRule.note);
        }
      } else {
        if (!isFirstTimedFocused || theRule.showOnFirstFocus) {
          valueIsTooShortToTest = (val.length < theRule.minTestLen);

          if (valueIsTooShortToTest) {
            ariaHide($hints.eq(i));
          } else if (testHasPassed) {
            this.hasError = false;
            ariaHide($hints.eq(i));
          } else {
            ariaShow($validations);
            ariaShow($hints.eq(i));
            ariaInvalid(this.$element);

            result.warnings.push(theRule.note);

            if (!isFirstTimedFocused && !this.hasError) {
              $elGroup.addClass(WARNING_CLASS);
            }
          }
        }
      }
    }

    if (result.warnings.length === 0 && result.errors.length === 0) {
      ariaHide($validations);
      ariaValid(this.$element);
      $elGroup.removeClass(ERROR_CLASS);
      $elGroup.removeClass(WARNING_CLASS);
    }

    return result;
  };

  function onFocus(e) {
    // For checkboxes, focus and change happen together. We need to ignore the
    // focus events in these cases as validate has already been handled.
    setTimeout(function() {
      if (!e.data.handled) {
        e.data.validate();
        e.data.handled = false;
      }
    }, 0);
  }

  function onKeyUp(e) {
    e.data.handled = true;
    e.data.validate();
  }

  function onChange(e) {
    e.data.handled = true;
    e.data.validate();
  }

  function onBlur(e) {
    var instance = e.data;
    var $el = instance.$element;
    var $validations = $('#' + $el.attr('id') + 'Validations');
    var inputHasWarnings = instance.validate().warnings.length > 0;
    var valueIsEmpty = $el.val() === '';
    var valueIsRequired = $el.attr('required');
    var $elGroup = $el.closest('.form-group');

    if (inputHasWarnings || (valueIsEmpty && valueIsRequired)) {
      $elGroup.addClass(WARNING_CLASS);
    }

    ariaHide($validations);
    $el.data('validation-first-focus', 'false');
    e.data.handled = false;
  }

  // PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function() {
      var $this   = $(this);
      var data    = $this.data('validatedInput');
      var options = $.extend({}, ValidatedInput.DEFAULTS, $this.data(), typeof option === 'object' && option);

      if (!data) {
        $this.data('validatedInput', (data = new ValidatedInput(this, options)));
      }
      if (typeof option === 'string') {
        data[option]();
      }
    });
  }

  var old = $.fn.validatedInput;

  $.fn.validatedInput             = Plugin;
  $.fn.validatedInput.Constructor = ValidatedInput;

  // NO CONFLICT
  // ====================

  $.fn.validatedInput.noConflict = function() {
    $.fn.validatedInput = old;
    return this;
  };

  // DATA-API
  // =================

  $(document).ready(function() {
    $('[data-validation]').each(function() {
      var $this   = $(this);
      var data    = $this.data('validatedInput');
      var option  = {
        validator: $this.data('validation')
      };

      if (!data) {
        Plugin.call($this, option);
      }
    });
  });
})();
(function() {
  'use strict';

  // PUBLIC CLASS DEFINITION
  // ================================

  var ValidatedForm = function(element, options) {
    this.$element   = $(element);
    this.options    = $.extend({}, ValidatedForm.DEFAULTS, options);

    this.addListeners();
  };

  ValidatedForm.VERSION  = '0.3.1';

  ValidatedForm.DEFAULTS = {};

  ValidatedForm.prototype.addListeners = function() {
    this.$element.on('click.validatedForm', this, onClick);
    $(this.options.summary).on('click.validatedForm', 'a', onErrorClick);
    $(this.options.resetbtn).on('click.validatedForm', this, onResetForm);
  };

  ValidatedForm.prototype.validate = function() {
    var $input, $label, $target;
    var target = this.options.container;
    var inputHasErrors, inputLabel;
    var errorList = [];

    if (!target) {
      $target = this.$element.closest('form') || $('body');
    } else {
      $target = $(target);
    }

    $target.find('[' + DATA_VALIDATION + ']').each(function() {
      $input = $(this);
      $input.data('validation-first-focus', 'false');

      inputHasErrors = $input.data('validatedInput').validate(true).errors.length > 0;

      if (inputHasErrors) {
        $label = $('label[for=' + this.id + ']');
        inputLabel = $label.attr(DATA_VALIDATION_LABEL) || $label.html();
        errorList.push({
          element: this,
          label: inputLabel,
          errors: $input.data('validatedInput').validate(true).errors.slice()
        });
      }
    });

    if (errorList.length > 0) {
      this.displaySummary(errorList);

      if (this.options.onError) {
        this.options.onError.call(this, errorList);
      }
    } else {
      if (this.options.onSuccess) {
        this.options.onSuccess.call(this);
      }
    }

    return (errorList.length === 0);
  };

  ValidatedForm.prototype.removeSummary = function(errorList) {
    var $summary = $(this.options.summary);
    $summary.removeClass('open').attr('aria-hidden', 'true');
  };

  ValidatedForm.prototype.displaySummary = function(errorList) {
    var $summary = $(this.options.summary);

    if (!errorList || errorList.length === 0) {
      this.removeSummary();
      return;
    }

    if ($summary.length > 0) {
      var summary = '';

      for (var i = 0; i < errorList.length; i++) {
        summary += '<li><a href="#' + errorList[i].element.id +
                   '">' + errorList[i].label + ' is invalid.</a></li>';
      }

      $summary.addClass('open').attr('aria-hidden', 'false').focus();
      $summary.find('ul').empty().append(summary);
    }
  };

  function onResetForm(e) {
    var instance = e.data;
    var $container = $(instance.options.container);
    $container.find('.' + WARNING_CLASS).removeClass(WARNING_CLASS);
    $container.find('.' + ERROR_CLASS).removeClass(ERROR_CLASS);
    instance.removeSummary();
  }

  function onErrorClick(e) {
    var $window = $(window),
        $anchorTarget = $($(e.currentTarget).attr('href'));
    $window.scrollTop($anchorTarget.offset().top - $window.outerHeight(true) / 2);
    $anchorTarget.focus();
    return false;
  }

  function onClick(e) {
    var instance = e.data;
    if (instance.validate()) {
      if (!instance.options.submits) {
        e.preventDefault();
      }
    } else {
      e.preventDefault();
    }
  }

  // PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function() {
      var $this   = $(this);
      var data    = $this.data('validatedForm');
      var options = $.extend({}, ValidatedForm.DEFAULTS, $this.data(), typeof option === 'object' && option);

      if (!data) {
        $this.data('validatedForm', (data = new ValidatedForm(this, options)));
      }
      if (typeof option === 'string') {
        data[option]();
      }
    });
  }

  var old = $.fn.validatedForm;

  $.fn.validatedForm             = Plugin;
  $.fn.validatedForm.Constructor = ValidatedForm;

  // NO CONFLICT
  // ====================

  $.fn.validatedForm.noConflict = function() {
    $.fn.validatedForm = old;
    return this;
  };
})();
/**
 * Base Validations
 *
 * Validator Properties:
 *  - maxlength        Number     Text input maximum number of chars
 *  - autocapitalize   Boolean    true or false (false)
 *  - autocorrect      Boolean    true or false (false)
 *  - placeholder      String     Text input placeholder text
 *
 * ValidatorRule Properties:
 *  - type             String     'requirement' or 'restriction' ('requirement')
 *                                  requirement = test must pass or field is invalid
 *                                  restriction = test must fail or field is invalid
 *  - note             String     Error message to display
 *  - regx             Regex      Single Regex or Array of Regexes (/.+/)
 *  - all              Boolean    If regx is an Array this flag will determine if
 *                                  all tests must pass or just one. (false)
 *  - minTestLen       Number     Number of chars before validation takes place (-1)
 *  - help             Boolean    Help will not trigger a warning or an error
 *  - showOnFirstFocus Boolean    Does this rule's note appear on first focus of
 *                                  input? (true)
 *  - func             Function   Can be used in place of 'regx' but not together.
 *                                  Function must return true or false based on the
 *                                  'type' set for the rule.
 */

window.validations = {

  password: {
    maxlength: 32,
    rules: [
      {
        note: 'Enter 8 to 32 characters',
        regx: /^.{8,32}$/
      },
      {
        note: 'Enter at least 1 letter and at least 1 number',
        regx: /^(?=.*\d)(?=.*[a-zA-Z]).+$/
      },
      {
        type: 'restriction',
        note: 'Input must not contain the word "Password"',
        regx: /[Pp]assword/
      }
    ]
  },

  email: {
    maxlength: 48,
    rules: [
      {
        note: 'Enter a proper email format (e.g., email@domain.com)'
      },
      {
        help: false,
        note: 'Enter a proper email format (e.g., email@domain.com)',
        regx: /^[\'_a-zA-Z0-9-]+(\.[\'_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/,
        minTestLen: 1
      },
      {
        help: false,
        note: 'Input must contain "@" and "."',
        regx: /^(?=.*@)(?=.*\.).+$/,
        minTestLen: 5
      },
      {
        type: 'restriction',
        note: 'Input must not have more than 48 characters',
        regx: /^.{49,}$/,
      },
      {
        type: 'restriction',
        note: 'Input must not start or end with "@" and "."',
        regx: [
          /^@/,
          /@$/,
          /^\./,
          /\.$/
        ]
      },
      {
        type: 'restriction',
        note: 'Input must not contain more than one "@"',
        regx: /^[^@]*@[^@]*(?=@)/
      },
      {
        type: 'restriction',
        note: 'Input must not have "." immediately following "@"',
        regx: /@\./
      },
    ]
  },

  phone: {
    maxlength: 14,
    placeholder: '(XXX) XXX-XXXX',
    rules: [
      {
        note: 'Enter 10 digits, no hyphens',
        regx: /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
      },
      {
        type: 'restriction',
        note: 'Invalid Phone Number',
        func: function(val) {
          var input = String(val.replace(/[^\d]/g, ''));
          if (input[0] === '0' || input[0] === '1') {
            return;
          }
          if (input.length >= 3 && input[1] === input[2]) {
            return;
          }
          if (input.length >= 4 && input[3] === '0' || input[3] === '1') {
            return;
          }
          if (input.length >= 6 && input[4] === '1' && input[5] === '1') {
            return;
          }
          if (input.length === 10 && '01234567890123456789'.indexOf(input) !== -1) {
            return;
          }
          if (input.length === 10 && '98765432109876543210'.indexOf(input) !== -1) {
            return;
          }

          switch (input) {
            case '0000000000':
            case '1111111111':
            case '2222222222':
            case '3333333333':
            case '4444444444':
            case '5555555555':
            case '6666666666':
            case '7777777777':
            case '8888888888':
            case '9999999999':
              return;
          }
          return true;
        }
      },
    ]
  },

  ssn: {
    maxlength: 11,
    placeholder: 'XXX-XX-XXXX',
    rules: [
      {
        note: 'Enter 9 digits',
        regx: [
          /^\d{9}$/,
          /^\d{3}-\d{2}-\d{4}$/
        ]
      }
    ]
  },

  ssn4: {
    maxlength: 4,
    placeholder: 'XXXX',
    rules: [
      {
        note: 'Enter 4 digits',
        regx: /^\d{4}$/
      }
    ]
  },

  zip: {
    maxlength: 5,
    placeholder: 'XXXXX',
    rules: [
      {
        note: 'Enter 5 digits',
        regx: /^\d{5}$/
      }
    ]
  },

  zip4: {
    maxlength: 9,
    placeholder: 'XXXXX-XXXX',
    rules: [
      {
        note: 'Enter 5 plus 4 digits',
        regx: [
          /^\d{5}$/,
          /^\d{5}-\d{4}$/
        ]
      }
    ]
  },

  date: {
    maxlength: 10,
    placeholder: 'mm/dd/yyyy',
    rules: [
      {
        note: 'Enter a proper date format (e.g., mm/dd/yyyy)',
        func: function checkEmail(val) {
          var dt, dstr, ustr;
          var dateWithSlashes = /^\d{2}\/\d{2}\/\d{4}$/;
          var dateWithDashes = /^\d{2}-\d{2}-\d{4}$/;
          if (!dateWithSlashes.test(val) && !dateWithDashes.test(val)) {
            return false;
          }
          dt = new Date(val);
          if (dt) {
            dstr = (('0' + (dt.getMonth() + 1)).slice(-2)).toString() +
                   (('0' + dt.getDate()).slice(-2)).toString() +
                   dt.getFullYear().toString();
            ustr = val.replace(/[^\d]/g, '').toString();
            return (dstr === ustr);
          }
          return false;
        }
      },
    ]
  },

  ccnum: {
    maxlength: 19,
    placeholder: 'XXXX-XXXX-XXXX-XXXX',
    rules: [
      {
        note: 'Enter 16 digits',
        regx: [
          /^\d{16}$/,
          /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
          /^\d{4}-\d{4}-\d{4}-\d{4}$/
        ]
      },
      {
        note: 'Input is not a valid credit card number',
        func: function checkLuhn(val) {
          var newval = val.replace(/[^\d]/g, '');
          var numdigits = newval.length;
          var sum = 0;
          var parity = numdigits % 2;
          var digit;

          if (numdigits !== 16) {
            return false;
          }

          for (var i = 0; i < numdigits; i++) {
            digit = parseInt(newval.charAt(i), 10);
            if (i % 2 === parity) {
              digit *= 2;
            }
            if (digit > 9) {
              digit -= 9;
            }
            sum += digit;
          }
          return (sum % 10) === 0;
        }
      }
    ]
  },

  ccexp: {
    maxlength: 7,
    placeholder: 'mm/yyyy',
    rules: [
      {
        note: 'Enter a proper format (e.g., mm/yyyy)',
        regx: /^\d{2}\/\d{4}$/
      }
    ]
  },

  ccv: {
    maxlength: 3,
    rules: [
      {
        note: 'Enter the last 3 digits of the ID number on the back of your Credit Card',
        regx: /^\d{3}$/
      }
    ]
  },

  abartn: {
    maxlength: 9,
    rules: [
      {
        note: 'Enter a valid bank account routing number',
        func: function checkAba(val) {
          var n = 0;

          for (var i = 0; i < val.length; i += 3) {
            n += parseInt(val.charAt(i), 10) * 3 +
                 parseInt(val.charAt(i + 1), 10) * 7 +
                 parseInt(val.charAt(i + 2), 10);
          }

          return (n !== 0 && n % 10 === 0);
        }
      },
      {
        note: 'Enter 9 digits',
        regx: /^\d{9}$/
      }
    ]
  },

  required: {
    rules: [
      {
        help: false,
        note: 'Input is required',
        regx: /.+/,
        showOnFirstFocus: false
      }
    ]
  }

};

})(jQuery, window, document);