exports.main = async (event: any) => {
  const data = event.body;
  // echo lambda
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: data,
  };
};
