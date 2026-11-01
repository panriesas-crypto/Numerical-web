import {Router} from 'express';import Preset from '../models/Preset.js';
const router=Router();
router.get('/',async(req,res,next)=>{try{const q={};if(req.query.category)q.category=req.query.category;if(req.query.method)q.method=req.query.method;const preset=await Preset.findOne(q).sort({createdAt:1}).lean();res.json({preset});}catch(e){next(e)}});
router.post('/',async(req,res,next)=>{try{const {category,method,title,input,description}=req.body;if(!category||!method||!title||input===undefined)return res.status(400).json({message:'category, method, title and input are required'});const preset=await Preset.findOneAndUpdate({category,method,title},{category,method,title,input,description},{new:true,upsert:true,runValidators:true});res.status(201).json({preset});}catch(e){next(e)}});
export default router;
