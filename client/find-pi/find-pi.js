import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Advisors } from '../../imports/collections.js';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.findPi.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('advisors',function () {
    // console.log(advisors.find().count());
  })
});

Template.findPi.onRendered(function(){

  var checkboxFilter = {

    // Declare any variables we will need as properties of the object

    $filters: null,
    $reset: null,
    groups: [],
    outputArray: [],
    outputString: '',

    // The "init" method will run on document ready and cache any jQuery objects we will need.

    init: function(){
      var self = this; // As a best practice, in each method we will asign "this" to the variable "self" so that it remains scope-agnostic. We will use it to refer to the parent "checkboxFilter" object so that we can share methods and properties between all parts of the object.

      self.$filters = $('#Filters');
      self.$reset = $('#Reset');
      self.$container = $('#Container');
      self.$filters.find('fieldset').each(function(){
        self.groups.push({
          $inputs: $(this).find('input'),
          active: [],
  		    tracker: false
        });
      });

      self.bindHandlers();
    },

    // The "bindHandlers" method will listen for whenever a form value changes.

    bindHandlers: function(){
      var self = this;

      self.$filters.on('change', function(){
        self.parseFilters();
      });

      self.$reset.on('click', function(e){
        e.preventDefault();
        self.$filters[0].reset();
        self.parseFilters();
      });
    },

    // The parseFilters method checks which filters are active in each group:

    parseFilters: function(){
      var self = this;

      // loop through each filter group and add active filters to arrays

      for(var i = 0, group; group = self.groups[i]; i++){
        group.active = []; // reset arrays
        group.$inputs.each(function(){
          $(this).is(':checked') && group.active.push(this.value);
        });
  	    group.active.length && (group.tracker = 0);
      }

      self.concatenate();
    },

    // The "concatenate" method will crawl through each group, concatenating filters as desired:

    concatenate: function(){
      var self = this,
  		  cache = '',
  		  crawled = false,
  		  checkTrackers = function(){
          var done = 0;

          for(var i = 0, group; group = self.groups[i]; i++){
            (group.tracker === false) && done++;
          }

          return (done < self.groups.length);
        },
        crawl = function(){
          for(var i = 0, group; group = self.groups[i]; i++){
            group.active[group.tracker] && (cache += group.active[group.tracker]);

            if(i === self.groups.length - 1){
              self.outputArray.push(cache);
              cache = '';
              updateTrackers();
            }
          }
        },
        updateTrackers = function(){
          for(var i = self.groups.length - 1; i > -1; i--){
            var group = self.groups[i];

            if(group.active[group.tracker + 1]){
              group.tracker++;
              break;
            } else if(i > 0){
              group.tracker && (group.tracker = 0);
            } else {
              crawled = true;
            }
          }
        };

      self.outputArray = []; // reset output array

  	  do{
  		  crawl();
  	  }
  	  while(!crawled && checkTrackers());

      self.outputString = self.outputArray.join();

      // If the output string is empty, show all rather than none:

      !self.outputString.length && (self.outputString = 'all');

      //console.log(self.outputString);

      // ^ we can check the console here to take a look at the filter string that is produced

      // Send the output string to MixItUp via the 'filter' method:

  	  // if(self.$container.mixItUp('isLoaded')){
     //  	self.$container.mixItUp('filter', self.outputString);
  	  // }
    }
  };

  $(function(){

    // Initialize checkboxFilter code

    checkboxFilter.init();

    // Instantiate MixItUp

    // $('#Container').mixItUp({
    //   controls: {
    //     enable: true
    //   },
    //   animation: {
    //     easing: 'cubic-bezier(0.86, 0, 0.07, 1)',
    //     duration: 600
    //   }
    // });
  });

//Dropdown Checkbox Functionality

  $(".checkbox-dropdown").click(function () {
    $(this).toggleClass("is-active");
    console.error("No dropdown!");
  });

  // $(".checkbox-dropdown ul").click(function(e) {
  //   e.stopPropagation();
  //   console.error("No dropdown!");
  // });

});

Template.findPi.helpers({
    findAdvisors: function(){
      const instance = Template.instance();
      let clicked_school = instance.state.get('school');
      let clicked_dept = instance.state.get('dept');
      if(clicked_school || clicked_dept) {
        if(clicked_school && clicked_dept){ 
          return Advisors.find({school: clicked_school, dept: clicked_dept });
        }
        else if(clicked_school && !(clicked_dept)){
          return Advisors.find({school: clicked_school });
        }
        else if(clicked_dept && !(clicked_school)){
          return Advisors.find({dept: clicked_dept });
        }
      }
      return Advisors.find();
    }
});

let state_arr = [];

Template.findPi.events({
    'click'(event){
        console.log(event.target.value);
    },
    'change .school'(event, instance) {
      if(event.target.checked){
        
        instance.state.set('school', event.target.value);
      } 
      else {
        instance.state.set('school', false);
      }
    },
    'change .dept'(event, instance) {
      if(event.target.checked){
        instance.state.set('dept', event.target.value);
      } 
      else {
        instance.state.set('dept', false);
      }
    }
});