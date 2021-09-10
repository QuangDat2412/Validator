// Doi tuong Validator
function Validator(options) {
    var selectorRules = {};
    
    function validate(inputElement, rule){
        var elementParent = inputElement.closest(options.formGroupSelector);
        var errorElement = elementParent.querySelector(options.errorSelector);
        var errorMessage;
        var rules = selectorRules[rule.selector];
        for(var i = 0; i < rules.length; ++i){
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }
        if(errorMessage){
            errorElement.innerText = errorMessage;
            elementParent.classList.add('invalid');
        }else {
            errorElement.innerText = '';
            elementParent.classList.remove('invalid');
        }
        return !!errorMessage;
    }
    var formElement = document.querySelector(options.form);
    
    if (formElement) {
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(isValid) {
                    isFormValid = false;
                }
            });

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    },{});
                    options.onSubmit(formValues);
                }else{
                    formElement.onsubmit();
                }
            }
        }

        options.rules.forEach(function (rule) {
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }
    
                inputElement.oninput = function(){
                    var elementParent = inputElement.closest(options.formGroupSelector);
                    var errorElement = elementParent.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    elementParent.classList.remove('invalid');
                }
            });
        });
    }
}

Validator.isRequired = function(selector,message) {
    return {
        selector: selector,
        test: function(value){
            return value ? undefined :message || 'Vui long nhap truong nay'
        }
    }
}

Validator.isEmail = function(selector,message) {
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Truong nay phai la email';
        }
    }
}

Validator.minLength = function(selector,min,message){
    return {
        selector: selector,
        test:function(value){
            return value.length >= min ? undefined : message || `Vui long nhap du ${min} ky tu`;
        }
    }
}

Validator.isConfirmed = function(selector,getConfirmValue,message) {
    return {
        selector:selector,
        test: function(value){
            return value===getConfirmValue() ? undefined:message || 'Gia tri nhap vao khong dung';
        }
    }

}