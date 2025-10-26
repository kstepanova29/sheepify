we are now going to be merging the branch sun+moon+bg into this branch. we note that sun+moon+bg is very outdated in its implementations of many things including the farmland and sheeps. Thus, when merging the branch into production ui the only changes to production ui is:
1. The background should become the background used in sun+moon+bg
2. The day and night cycle and switch to daybutton should be imported as well
3. The animation for the moon and the new sun and the new moon (similar to the windmill animation) should also be taken
4. Implementation of sheep should remain constant except for the sheep animation (which is similar in nature and implementation to the windmill)

Note that things might go terribly wrong so if i want to revert back we will revert to this moment,