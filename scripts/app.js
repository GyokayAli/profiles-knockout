/** Read file **/
var dataSource = "files/data.txt";
var data = $.ajax({
    url: dataSource,
    async: false
}).responseText;
/** end */

function Profile(first, last, email, registered, range, tags, isActive) {
    this.name = {
        first: first,
        last: last
    };
    this.email = email;
    this.registered = registered;
    this.range = range.split(',').map(Number).filter(x => !isNaN(x));
    this.tags = tags.split(',').filter(x => x != '' && x != ' ');
    this.isActive = isActive;
}

function ViewModel() {
    var self = this;
    //json array of profile details
    this.profiles = ko.observableArray(JSON.parse(data));

    this.first = ko.observable();
    this.last = ko.observable();
    this.email = ko.observable();
    this.registered = ko.observable();
    this.range = ko.observableArray();
    this.tags = ko.observableArray();
    this.isActive = ko.observable();

    this.shouldShowForm = ko.observable(false);
    this.revealForm = function () {
        self.shouldShowForm(true)
    }
    this.closeForm = function () {
        self.shouldShowForm(false)
    }
    this.addNewProfile = function () {
        self.profiles.push(new Profile(this.first(), this.last(), this.email(),
            this.registered(), this.range(), this.tags(), this.isActive()));
        self.shouldShowForm(false)
    }

    this.selectedItem = ko.observable();

    this.deleteProfile = function (itemToDelete) {
        self.profiles.remove(itemToDelete);
        self.selectedItem(null);
    };

    this.editProfile = function (item) {
        self.selectedItem(item);
    };

    this.acceptProfileEdit = function () {
        self.selectedItem(null);
    };

    this.templateToUse = function (item) {
        return self.selectedItem() === item ? 'editTmpl' : 'itemTmpl';
    };

    //custom tooltip for each table row
    this.customTooltip = function (firstName, lastName, isActive) {
        if (isActive)
            return firstName + " " + lastName + "'s profile is editable";
        else
            return firstName + " " + lastName + "'s profile is not editable";
    }

    //sum of values in range[]
    this.totalRange = function (range) {
        return ko.computed(function () {
            var total = 0;
            for (var i = range.length; i--;) {
                total += range[i];
            }
            return total;
        }, this);
    };

    //customized jQuery datepicker
    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var $el = $(element);

            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {
                    minDate: new Date(),
                    dateFormat: 'DD, MM dd, yy'
                };
            $el.datepicker(options);

            //handle the field changing
            ko.utils.registerEventHandler(element, "change", function () {
                var observable = valueAccessor();
                observable($el.val());
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $el.datepicker("destroy");
            });

        },
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                $el = $(element),
                current = $el.datepicker("getDate");

            if (value - current !== 0) {
                $el.datepicker("setDate", value);
            }
        }
    };
}
ko.applyBindings(new ViewModel());