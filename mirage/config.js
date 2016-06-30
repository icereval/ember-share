export default function() {
    this.get('/');
    this.get('/normalized');
    this.get('/normalized/:id');
    this.get('/changeset');
    this.get('/changeset/:id');
    this.get('/change');
    this.get('/change/:id');
    this.get('/venue');
    this.get('/venue/');
    this.get('/institution');
    this.get('/institution/:id');
    this.get('/manuscripts');
    this.get('/manuscript/:id');
    this.get('/preprint');
    this.get('/preprint/:id');
    this.get('/creative_work');
    this.get('/creative_work/:id');
    this.get('/tag');
    this.get('/tag/:id');
    this.get('/taxonomy');
    this.get('/taxonomy/:id');
    this.get('/data_provider');
    this.get('/data_provider/:id');
    this.get('/award');
    this.get('/award/:id');
    this.get('/funder');
    this.get('/funder/:id');
    this.get('/raw');
    this.get('/raw/:id');
}
