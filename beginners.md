Title: A beginner's guide to dPASP

# A beginner's guide to \(\dpasp\)

!!! abs "Abstract"
    This guide is a comprehensive tutorial on the \(\dpasp\) framework, complete with examples and
    the required foundations to understand the theoretical underpinnings behind
    (neuro-)probabilistic answer set programming. More precisely, in this article, you will: (1)
    learn what answer set programming (ASP) --- and more broadly, logic programming (LP) --- is,
    (2) understand how probabilistic logic programming (PLP) extends LP, (3) learn how to do
    inference in probabilistic answer set programming (PASP), (4) further extend PLPs with neural
    predicates and (5) understand how to learn the parameters of a neuro-probabilistic answer set
    program; all within the syntax of \(\dpasp\) and complete with concrete examples you can run
    with the language. **Please note that this is a work-in-progress; use at your own risk!**

## Table of Contents

[TOC]

### Prelude

!!! warn "Disclaimer"
    This guide is meant to introduce basic concepts of probabilistic logic programming within
    the context and syntax of [\(\dpasp\)](https://github.com/kamel-usp/dpasp). A separate guide,
    [*"\(\dpasp\) in a Nutshell"*](nutshell.html) is available for users who are already
    familiarized with PLPs and simply want to learn the syntax and features of \(\dpasp\).

\(\dpasp\) (or simply dPASP) is a neuro-probabilistic logic programming language aimed at providing
a declarative framework for the description, inference and learning of knowledge-rich probabilistic
problems. To understand what all of this means, let's first dissect the semantics of the
framework's name.

\(\dpasp\) stands for *differentiable Probabilistic Answer Set Programming*. These words might not
mean much now, but they do paint a picture of what exactly we will be working on in this tutorial.
To better understand what all these words mean, it might be perhaps more pedagogical to
parenthesize it as follows: *(differentiable) (Probabilistic) (Answer Set Programming)*. Each
section in this tutorial aims at explaining each one of the terms in parenthesis; and in true
programming language fashion, we shall work backwards from right to left:
[Section 2](#answer-set-programming) is dedicated to explaining what Logic Programming (LP), with an
emphasis on Answer Set Programming (ASP), is; [Section 3](#probabilistic-answer-set-programming)
explains how we extend ASP to the probabilistic domain, i.e. Probabilistic ASP (PASP); and [Section
4](#differential-probabilistic-answer-set-programming) equips PASP with neural predicates, allowing
for differentiable neural frameworks to work with PASP. Ideally, by the end of this tutorial, you
should have an (at least broad) understanding of what each of the terms in \(\dpasp\)'s name mean
and what the relationship of these terms mean and entails.

!!! warn "What should I know before continuing?"
    This tutorial assumes the reader has a basic mathematical background on propositional and
    first-order logic, probability theory, and machine learning. Although it is possible to follow
    most of this tutorial without knowing much of the aforementioned topics, we recommend you
    familiarize with these topics to truly understand and appreciate the concepts here covered.

### Answer Set Programming

Answer Set Programming (ASP) is a declarative paradigm for modelling and reasoning about
combinatorial problems involving some kind of common sense reasoning
[@eiter09,@gebser17,@gelfond88] through a language that is familiar to logicians. So let us begin
with some notation and definitions we shall use throughout all this tutorial.

#### Horn Clauses and rules

An *atom* \(p(t_1,t_2,\dots,t_n)\) is composed out of a predicate \(p\) with arity \(n\) and each
term \(t_i\) is either a constant, a logical variable. If \(p\) has arity 0, then we simply write
out \(p\). An atom without variables is said to be *ground*. The definition of ground extends to
most other constructs in ASP; from here on out, saying an object is ground means this object has no
variables. A *literal* is either an atom \(p(t_1,\dots,t_n)\) or an atom preceded by \(\neg\),
meaning it is (classically) negated.

ASP is, just like most other logic programming languages (e.g.
[Prolog](https://en.wikipedia.org/wiki/Prolog), [Datalog](https://en.wikipedia.org/wiki/Datalog)),
based around Horn clauses. A Horn clause is a disjunction of literals of the form
$$
h_1 \vee h_2 \vee\cdots\vee h_m \vee\neg b_1 \vee\neg b_2 \vee\cdots\vee\neg b_k,
$$
meaning it is equivalent to the implication
$$
h_1 \vee h_2 \vee\cdots\vee h_m \gets b_1 \vee b_2 \vee\cdots\vee\ b_k.
$$

An ASP program is a set of such *rules* (i.e. Horn clauses), where each literal \(b_i\) may be
preceded by a negation as failure `#!pasp not`, which we shall discuss shortly. We denote the set
of literals \(h_1,\dots,h_m\) the *head* of the rule, and the set \(b_1,\dots,b_k\) the *body*.
Further, we call each element \(b_i\) of the body, a *subgoal* of its rule.

To further understand rules and how they are interpreted within an ASP program, we must first take
a brief interlude into interpretations and satisfiability. The *Herbrand base* of a program is the
set of ground atoms produced from all combinations of predicates and constants in the program.
An *interpretation* is a subset of the Herbrand base that does not contain an atom *and* its
negation. A ground literal is true (resp. false) with respect to an interpretation when it is
(resp. is not) an element of the interpretation. We further extend this to ground subgoals: a
ground subgoal is true (resp. false) when it is (resp. is not) in the interpretation. Finally, a
ground rule is *satisfied* by an interpretation if and only if either some of the subgoals in the
body are false, or all subgoals in the body and some literals in the head are true with respect to
the interpretation.

A *model* \(\mathcal{I}\) of a program is an interpretation that satisfies all rules of the logic
program, and it is *minimal* if and only if no other model \(\mathcal{J}\) is a subset of
\(\mathcal{I}\). We shall return to models later on; let us get back to rules for now.

A rule in ASP may be intuitively interpreted as a conditional operation with respect to its body:
*if* \(b_1,\dots,b_k\) *are all satisfied, then one of* \(h_1,\dots,h_m\) *must be true*. A special
case arises when \(m=0\), equivalently written as
$$
\bot \gets b_1\vee\cdots\vee b_k;
$$
i.e., when the body is true, we reach a contradiction. This seemingly impossible rule is a valid
ASP expression and is equivalent to saying \(b_1,\cdots,b_k\) *are prohibited to ever appear
together*. This special rule is often called an *integrity constraint*. Other special rules include
when \(m=1\), which we call *normal rules*; and when \(k=0\). This last one is equivalent to
writing out
$$
h_1\vee\cdots\vee h_m\gets\top,
$$
i.e., one of \(h_1,\dots,h_m\) must be true. When we add the constraint that \(k=1\), or in other
words \(h\gets\top\), then we ensure that \(h\) must always be true (is a *fact* in our knowledge
base).

So far, we have only considered positive rules: rules that contain no negation as failure (`#!pasp
not`'s) nor classical negations (\(\neg\)). The semantics of negation as failure is simple, yet
tricky: the expression `#!pasp not` \(a\) is true when we cannot derive \(a\); thus given a model
\(\mathcal{I}\) either \(a\) is true and \(a\in\mathcal{I}\), or it is false and
\(a\not\in\mathcal{I}\). It's important to note that `#!pasp not` \(a\) is different from \(\neg
a\). In fact, one might have a situation where neither \(a\) nor `#!pasp not` \(a\) is in the
model. In practice, it is usually sufficient to only use `#!pasp not`, and so we won't be looking
at classical negation going forwards.

Rules, facts and integrity constraints are written in the following way in \(\dpasp\).
```pasp
% The implication becomes :- in pasp.
avocado :- green_B2C248, pear_shaped, not pear.
% An integrity constraint has no head.
:- parking, stopping.
% The atom below is a fact.
earth_round.
```

Atoms in \(\dpasp\) may contain letters, digits and underlines, but must begin with a lower-case
letter. All statements (rules, facts, aggregates, directives, etc.) must end with a period.

Let us now review what we have seen so far through a more concrete example. Suppose that I wish to
identify an animal by its characteristics. I have a knowledge base on the features of the animal I
am trying to classify, and rules that describe expert knowledge.

```pasp
% We have identified that the animal...
has_wings. likes_cold. has_white.

% We know that penguins have wings, white fur and like the cold; but do not fly.
penguin :- has_wings, likes_cold, has_white.
% The line below is equivalent to negating flies in the line above.
:- penguin, flies.

% We know that polar bears have white fur and like the cold.
polar_bear :- likes_cold, has_white, not has_wings, not has_beak, not flies.

% We know albatrosses have wings, white feathers and fly.
albatross :- has_wings, has_white, flies.
```
```
Model: has_white likes_cold has_wings penguin
```

If we were to run an ASP solver, such as [clingo](https://potassco.org/clingo/) [@gebser17], we
would find that the program has a single model (shown above). Note that `penguin` is true, and both
`albatross` and `polar_bear` are false (not in the model). Because ASP is closed-world, and we have
given no information that atom `flies` is true, it must follow that `albatross` *must* be false. In
the case of `polar_bear`, the subgoals `#!pasp not has_wings` and `#!pasp not has_beak` could not
be satisfied, and so `polar_bear` *must* be false.

So far we have only touched ground rules, which means all of our examples were *propositional*
programs. It is much more interesting, however, to work with programs containing variables.
Consider the following example.

```pasp
% A duck, by definition, quacks, flies and swims.
duck(X) :- quacks(X), flies(X), swims(X).
% My knowledge base of birds.
quacks(parrot). flies(parrot). % parrots do not swim.
swims(kiwi). % kiwis do not fly nor quack.
quacks(goose). flies(goose). swims(goose).
quacks(mallard). flies(mallard). swims(mallard).
quacks(teal). flies(teal). swims(teal).

```
```
Model: ... duck(goose) duck(mallard) duck(teal)
```



#### Cycles and the Stable Model Semantics

As we have briefly seen, the minimal model of a program is an interpretation \(\mathcal{I}\) that
satisfies the rules of the program and that allows no other model \(\mathcal{J}\) to be
\(\mathcal{J}\subset\mathcal{I}\). When we are looking at the *semantics* of a program --- how we
interpret a logic language ---, we are usually searching for an answer to the program that makes
sense within the constructs we have imposed to our language and the constraints encoded in our
program. In this subsection, we will discuss the *stable model* semantics in ASP and their
relationship with the structure of a program.

Suppose we have a program \(\Pi\) and an interpretation \(\mathcal{I}\). The *reduct*
\(\Pi^\mathcal{I}\) is the 


#### Aggregates and Disjunctions

#### Partial and Least Undefined Semantics

### Probabilistic Answer Set programming

### Differential Probabilistic Answer Set Programming

### References
