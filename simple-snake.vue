<template>
    <snake-game :apples="1" :width="400" :height="800">
      <simple-snake :x="0" :y="0" :velocity="1" :horizontal="false" :maxCells="2" :color="green" #snake>
        <key-brain :map="{asdf}" #brain/>
        <game-pad-brain :map="{asdf}" #brain/>
      </simple-snake>
    </snake-game>
</template>