MathJax = {
  options: {
    renderActions: {
      find: [10, function (doc) {
        for (const node of document.querySelectorAll('script[type^="math/tex"]')) {
          const display = !!node.type.match(/; *mode=display/);
          const math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
          const text = document.createTextNode('');
          node.parentNode.replaceChild(text, node);
          math.start = {node: text, delim: '', n: 0};
          math.end = {node: text, delim: '', n: 0};
          doc.math.push(math);
        }
      }, '']
    }
  },
  chtml: {
    scale: 0.9,
  },
  svg: {
    scale: 0.9,
  },
};

window.MathJax["tex"] = {
  macros: {
    dpasp: "{\\small\\partial\\mathbb{P}[\\text{ASP}]}",
    pasp: "{\\mathbb{P}\\text{ASP}}",
    pr: "{\\mathbb{P}}",
    set: ["{\\mathbf{#1}}", 1],
  }
};
