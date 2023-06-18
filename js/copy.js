const blocks = document.querySelectorAll("div.highlight");

blocks.forEach(div => {
  const copyblk = document.createElement("div");
  copyblk.className = "copy";
  copyblk.addEventListener("click", handleCopyClick);
  const copy = document.createElement("i");
  copy.className = "fa fa-clone"
  copy.setAttribute("aria-hidden", "true");
  copyblk.append(copy);
  div.append(copyblk);
});

function handleCopyClick(event) {
  var range = document.createRange();
  range.selectNode(event.target.parentElement.parentElement);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  if (!navigator.clipboard) document.execCommand("copy");
  else navigator.clipboard.writeText(range);
  window.getSelection().removeAllRanges();
}
