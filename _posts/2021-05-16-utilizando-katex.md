---
layout: post
title:  "Utilizando o Katex"
---

![image info](/assets/img/2021-05-16-utilizando-katex.png)

Criar conteúdo e distribuí-lo pela rede é uma responsabilidade muito grande. Ficar só na superfície de toda essa informação não preocupa muita gente. Felizmente os cientistas e engenheiros se preocupam bastante com isso e costumam focar bastante em fundamentos de conceitos e técnicas. Principalmente coisas que se ligam diretamente com a matemática.

A Matemática é a ferramenta mais básica que usamos no dia dia para modelar e resolver problemas.

Por isso o exercício da leitura e escrita de equações elevará nosso ***KI***. Isso certamente irá nos capacitar modelar e resolver problemas com mais rigor científico e começar a construir nossos próprios mecanismos de validações empíricos.

É notável que processos de implementações de soluções para problemas matemáticos em alguns softwares não são documentados de uma maneira que alguém seja capaz de compreender a lógica e tão pouco a modelagem do problema, isto é, quando existe. E isso é um problema. Pois dificulta a manutenção e diminui muito a confiabilidade da implementação. A matemática é a linguagem mais básica que todo profissional da área de exatas deve dominar.

  > Por que não usa-lá como essência ?

Com o objetivo de desbravar um pouco mais de como a linguagem matemática pode ser explorada na programação, vamos integrar uma ferramenta de transpilação que nos permite trabalhar com expressões escritas em **Latex**. E para isso vamos usar uma biblioteca muito utilizada pela comunidade javascript: o [***Katext***](https://katex.org/)

Pensando em um design de implementação para essa funcionalidade: a ideia é ser o mais minimalista possível; tanto no uso como na implementação. O melhor caminho para alcançar esse objetivo é usar a api nativa do javascript para escrever componentes.

Primeiro Importamos a biblioteca a partir de um *cdn*:

```html
<script src="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.js" integrity="sha384-7u+OeKP8De/qfWU/3s5KUDC2wvwPe+d5GwojxjiwFJJpHAp38wQFtz3tr2QNGidv" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js" integrity="sha256-4O4pS1SH31ZqrSO2A/2QJTVjTPqVe+jnYgOWUVr7EEc=" crossorigin="anonymous"></script>
```

Existem outras possibilidades de integração com o node, vamos trabalhar com o objeto `katex` global incluído a partir do cdn acima.

Depois definimos o componente `<j-katex>`:

```html
<script>
  (function() {
    const createKatexComponent = function () {
      class JKatex extends HTMLElement {
        constructor() {
          super();
          this.innerHTML = window.katex.renderToString(this.innerHTML, {
            throwOnError: false
          })
        }
      }
      customElements.define('j-katex', JKatex);
    }

    createKatexComponent()
  })();
</script>
```

Para relembrar a primeira aula de cálculo na faculdade, vamos escrever a expressão de definição de derivada dada por um limite de uma função real:

Latex:
{% raw %}
  ```html
<j-katex>\frac{d}{{dx}}f\left( x \right) = \mathop {\lim }\limits_{\Delta \to 0} \frac{{f\left( {x + \Delta } \right) - f\left( x \right)}}{\Delta }</j-katex>
  ```
Resultado:
<div class="container mt-lg">
  <j-katex>\frac{d}{{dx}}f\left( x \right) = \mathop {\lim }\limits_{\Delta \to 0} \frac{{f\left( {x + \Delta } \right) - f\left( x \right)}}{\Delta }</j-katex>
</div>
{% endraw %}

---

Agora vamos modelar uma implementação dada uma interface:

```php
interface ContaContract {
    public function getSaldo();
}

class ContaCorrente implements ContaContract {
    public function getSaldo()
    {
        return $this->transacoes->sum('valor');
    }
}
```

Uma coisa interessante nesse processo é perceber que o domínio pode definir vários aspectos da modelagem e é importante conhecê-lo para propor uma parametrização do sistema. Mas de maneira trivial asumimos que o saldo **S** é a soma dos valores de todas as transações feitas na conta:

Então temos:

*Saldo* = ***S***

*Valor da transação* = ***Vt***

Logo para conhecer o valor do saldo temos que implementar essa expressão:

{% raw %}
  <div class="container">
    <j-katex>S=\sum_{a=i}^{b=n}V_{t_{i}}+V_{t_{i+1}}+V_{t_{i+2}}+\cdot\cdot\cdot+V_{t_{n-1}}+V_{t_{n}}</j-katex>
  </div>
{% endraw %}

Essa notação de somatório é a mais clássica que existe.

Perceba que a cada elemento incrementamos 1 ao índice da coleção de transações.
Nesse caso aqui o método `$this->transacoes->sum('valor')` é uma implementação da procedure `sum` presente nos bancos de dados e executa a soma de uma determinada coluna numa coleção de resultados.

Lidando com arrays poderiamos escrever uma tradução dessa equação da seguinte maneira:

```php
$transacoes = [1, -3, 30.2, -0.3];
$saldo = 0;
for ($i = 0; $i <= count($transacoes); $i++) {
    $saldo = $saldo+$transacoes[$i];
}
```
Esta é uma abordagem trivial. Existem muitas coisas interessantes além disso para explorar nesse universo. Mas deixo o deixa e quem sabe no futuro novas publicações sobre o tema.

Até breve!
