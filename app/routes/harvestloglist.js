import Ember from 'ember';

export default Ember.Route.extend({

      model: function(params) {
        return this.get('store').find('source-config', params.id);
      },
});
