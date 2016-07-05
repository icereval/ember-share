export default function() {
    this.passthrough('http://localhost:9200/share/**');
    this.namespace = '/api';
    this.get('/normalized');
    this.get('/normalized/:id');
    this.get('/changeset');
    this.get('/changeset/:id');
    this.get('/changes');
    this.get('/changes/:id');
    this.get('/venues');
    this.get('/venues/');
    this.get('/institutions');
    this.get('/institutions/:id');
    this.get('/manuscripts');
    this.get('/manuscript/:id');
    this.get('/preprints');
    this.get('/preprints/:id');
    this.get('/creative-works');
    this.get('/creative-works/:id');
    this.get('/tags');
    this.get('/tags/:id');
    this.get('/taxonomy');
    this.get('/taxonomy/:id');
    this.get('/data-providers');
    this.get('/data-providers/:id');
    this.get('/awards');
    this.get('/awards/:id');
    this.get('/funders');
    this.get('/funders/:id');
    this.get('/raw');
    this.get('/raw/:id');
}
