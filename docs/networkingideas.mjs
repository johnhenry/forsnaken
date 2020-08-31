const IncomingRequest = class{
  constructor(stream){

  };
}

const IncomingResponse = class{
  constructor(stream){

  };
}

let OutgoingRequest;

let OutgoingResponse;


const fetch = async (request) => {
  const { host } = request.headers;
  const ip = await dns(host);
  const stream = new Stream(ip);
  request.send(stream);
  const response = new Response(stream);
  await response.status();
  return response();
};

//
const request = new Request();
const response = await fetch (request);
//


