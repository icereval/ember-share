import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType
});

Router.map(function() {
  this.route('curate', function() {
      this.route('work', { path: '/work/:work_id' });
      this.route('person', { path: '/person/:person_id' });
  });
  this.route('changes');
  this.route('discover');
});

export default Router;
