import Ember from 'ember';

export default Ember.Route.extend({

	model() {
		return Ember.RSVP.hash({
			harvestlog: this.store.findAll('harvest-log'),
		});
	}

});
