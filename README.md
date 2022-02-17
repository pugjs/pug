This is a customized Pug for [Fiction.live](https://fiction.live) [Scripting](https://fiction.live/stories/Fiction-live-Scripting-Guide/pJSFhShedzWhiaXQN). 

For full information on pug head over to [pugjs.org](https://pugjs.org/)



The main difference is that `{` works as the start of a new text line. 



In regular Pug this will throw an error and refuse to compile:

    div
      {if soulgate}
      img(src="{imagePath}/story/summoning")
      p After 3 years of efforts, you finally manage to open the Soulgate. You are face to face with the demon you have been chasing, Xozan.
      {/if}

You would have to do this:

    div
      | {if soulgate}
      img(src="{imagePath}/story/summoning")
      p After 3 years of efforts, you finally manage to open the Soulgate. You are face to face with the demon you have been chasing, Xozan.
      | {/if}

But now the first version compiles.
