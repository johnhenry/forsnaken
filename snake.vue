<template>
      <snake-game>
      <apple-field :x="[0, 99]" :y="[0, 99]" :size="1" #goal>
      </apple-field>
      <snake :x="0" :y="0" :dy="1" :hp="4" #player>
        <key-brain :map="{wasd}" #brain></key-brain>
      </snake>
      <snake :x="100" :y="100" :dy="-1" :hp="4" #player>
        <key-brain :map="{asdf}" #brain></key-brain>
      </snake>
    </snake-game>
</template>