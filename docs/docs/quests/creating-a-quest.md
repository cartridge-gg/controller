---
title: Creating a Quest
sidebar_position: 1
slug: /quests/creating-a-quest
---

If a quest does not have completion criteria then `completion` can be omitted from its metadata. These are completed for the player as soon as the event is emitted.

---
**Use the zero address as the player when defining the quest**

---

1. Emit the `quest_progress` event to create a quest for any tasks that will be part of the completion criteria
1. Emit the `quest_progress` event to create the quest for the parent, including the child quests if it has any in its metadata
