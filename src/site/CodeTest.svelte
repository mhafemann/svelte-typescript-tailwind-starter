<script lang="ts">
  import { Code } from '../components/index'
  let source = `code[class*="language-"],
pre[class*="language-"] {
	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;
	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
	white-space: pre;
	white-space: pre-wrap;
	word-break: break-all;
	word-wrap: break-word;
	line-height: 1.5;
	color: #59ca56;
	text-shadow: 0;
}
`
</script>

<!-- prettier-ignore -->
<div class="flex justify-center">
  <div class="container">
    <Code source={source} lang="css"/>
  </div>
</div>
