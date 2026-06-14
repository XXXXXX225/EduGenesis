# Backpropagation Deep Dive

Backpropagation is the algorithm that makes deep learning possible.

## Chain Rule in Networks
- dL/dw^(l) = dL/da^(L) * da^(L)/dz^(L) * ... * da^(l)/dz^(l) * dz^(l)/dw^(l)

## Computational Graph
- Nodes: operations (+, *, activation)
- Edges: data flow (tensors)
- Forward: compute values top-down
- Backward: compute gradients bottom-up

## Gradient Flow
- dL/dw = sum over paths of product of local gradients
- Autograd systems (PyTorch, TensorFlow) handle this automatically

## Vanishing Gradient Problem
- Deep sigmoid networks: gradients multiply to near zero
- Solution: ReLU, BatchNorm, Residual connections

**Key Takeaway**: Understand backprop intuitively, but let autograd do the computation.
