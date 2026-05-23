const createStreamResponse = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  return {
    send: (data) => {
      try {
        console.log(`data: ${JSON.stringify(data)}\n\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.log("send stream error", error);
      }
    },
    end: () => {
        try {
            res.write('event: end\ndata: {"done": true}\n\n');   
            res.end();
        } catch (error) {
            console.log("end stream error", error);
        }
    },
    error: (error) => {
        try {
            res.write(`data: ${JSON.stringify(error)}\n\n`);
        } catch (error) {
            console.log("error stream error", error);
        }
    },
   };
};

module.exports = {
  createStreamResponse,
}
  