const blocks = document.querySelectorAll("div.highlight");

blocks.forEach(div => {
  const copyblk = document.createElement("div");
  copyblk.className = "copy";
  const copy = document.createElement("i");
  copy.className = "fa fa-clone"
  copy.setAttribute("aria-hidden", "true");
  copy.addEventListener("click", handleCopyClick);
  copyblk.append(copy);
  div.append(copyblk);
});

function handleCopyClick(event) {
  var range = document.createRange();
  range.selectNode(event.target.parentElement);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}
