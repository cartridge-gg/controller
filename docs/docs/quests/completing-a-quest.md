---
title: Completing a Quest
sidebar_position: 2
slug: /quests/completing-a-quest
---

Any time the `quest_progress` event is emitted and it either does not have completion criteria, or the completion criteria is met, the quest is completed. quests can be completed multiple times.

quests without `completion` in its metadata will be completed for the player as soon as the event is emitted.

If it does have completion criteria:

1. Complete any child quests in the completion criteria first by emitting the `quest_progress` events for at least as many times as the criteria requires
1. Emit `quest_progress` for the parent quest when all completion criteria is satisfied to complete it
