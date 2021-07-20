const heroes = require('../models/heroes_model')

const heroesData = async (req, res) => {
  // if(true){

  //   if(true){
  //     res.status(403).send({ error: result.error });
  //   }else{
  //     res.status(200).send(result);
  //   }
  // }else{
  //   res.status(400).send({ error: 'Name need to be entered completely' });
  // }
  res.status(200).send('1')
}

module.exports = {
  heroesData
}
