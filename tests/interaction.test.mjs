import test from 'node:test';
import assert from 'node:assert/strict';
import { selectInteraction } from '../interaction.mjs';
test('interaction gates unavailable and out-of-range targets and prioritizes mission over loot',()=>{
  const loot={id:'loot',position:{x:0,z:0},distance:2.2,available:true};
  const mission={id:'mission',position:{x:0,z:0},distance:2.8,available:true,priority:10};
  assert.equal(selectInteraction({x:0,z:0},[loot,mission]),mission);
  assert.equal(selectInteraction({x:0,z:0},[loot,{...mission,available:false}]),loot);
  assert.equal(selectInteraction({x:2.2,z:0},[loot]),null);
  assert.equal(selectInteraction({x:2.79,z:0},[mission]),mission);
  assert.equal(selectInteraction({x:2.8,z:0},[mission]),null);
});
test('selected target invokes only its own action and consumed targets become unavailable',()=>{
  let rewards=0;
  const target={id:'crate',action:'Open',position:{x:0,z:0},distance:2,available:true,activate(){rewards++;this.available=false;}};
  selectInteraction({x:0,z:0},[target]).activate();
  assert.equal(rewards,1);
  assert.equal(selectInteraction({x:0,z:0},[target]),null);
});
