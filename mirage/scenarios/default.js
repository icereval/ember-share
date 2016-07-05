export default function(server) {
  server.createList('manuscript', 15);
  let funders = server.createList('funder', 15);
  server.createList('institution', 15);
  server.createList('tag', 15);
  server.createList('venue', 15);
  server.createList('data-provider', 15);
  server.createList('award', 15);
  server.createList('creative-work', 15, {funders});
}
