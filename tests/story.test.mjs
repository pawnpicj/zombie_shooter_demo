import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,createCampaign,clearCampaignWave,interactCampaign} from '../story.mjs';
test('campaign requires cleared combat and proximity before collecting evidence',()=>{
  const state=createCampaign(),point=CAMPAIGN[0].point;
  assert.equal(interactCampaign(state,point),false);
  clearCampaignWave(state);
  assert.equal(interactCampaign(state,{x:0,z:0}),false);
  assert.equal(state.chapter,0);assert.deepEqual(state.evidence,[]);
  assert.equal(interactCampaign(state,point),true);
  assert.equal(state.chapter,1);assert.equal(state.phase,'combat');
  assert.deepEqual(state.evidence,['security-log']);
  assert.equal(interactCampaign(state,CAMPAIGN[1].point),false);
});
test('all three missions recover evidence in order and complete exactly once',()=>{
  const state=createCampaign();
  for(const chapter of CAMPAIGN){
    assert.equal(clearCampaignWave(state),true);
    assert.equal(clearCampaignWave(state),false);
    assert.equal(interactCampaign(state,chapter.point),true);
  }
  assert.equal(state.complete,true);assert.equal(state.phase,'complete');
  assert.deepEqual(state.evidence,['security-log','formula-x','extracted']);
  assert.equal(interactCampaign(state,CAMPAIGN[2].point),false);
  assert.equal(clearCampaignWave(state),false);
  assert.deepEqual(createCampaign(),{chapter:0,phase:'combat',evidence:[],complete:false});
});
