var express = require('express');

var travelService = require("../services/travelService.js");
var router = express.Router();

var dotenv = require('dotenv');

const { createStreamResponse } = require("../utils/streamUtils.js");


dotenv.config();

router.post("/chat", async (req, res, next) => {
  const { message } = req.body;
  if(!message) {
    return res.json({
      success: false,
      message: 'message is required',
      status: 400
    })
  }
  const stream = createStreamResponse(res);

  const result = await travelService.chat(message, (content)=>{
    stream.send({
      type: 'chunk',
      content,
    });
  })
  stream.send({
    type: 'complete',
    data: result, 
  });
  stream.end();
});

router.post("/recommend", async (req, res, next) => {
  const { city, budget, days } = req.body;
  console.log(req.body);
  if(!city || !budget || !days) {
    return res.json({
      message: 'city, budget, days is required',
      status: 400
    })
  }
  const recommend = await travelService.recommend(city, budget, days);
  res.json(recommend);
});

module.exports = router;
