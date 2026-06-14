# Feedforward Neural Networks

Neural networks learn hierarchical representations from data.

## Architecture
- Input layer -> Hidden layers -> Output layer
- Each neuron: activation(W*x + b)
- Universal approximation theorem

## Activation Functions
- ReLU: max(0, z) — most common
- Sigmoid: 1/(1+e^(-z)) — for binary output
- Tanh: (e^z - e^(-z))/(e^z + e^(-z)) — zero-centered
- Leaky ReLU, ELU, Swish

## Forward Propagation
- Layer by layer: a^(l) = activation(W^(l)*a^(l-1) + b^(l))

## Training Loop
1. Forward pass: compute predictions
2. Compute loss
3. Backward pass: compute gradients
4. Update weights: w -= lr * grad

**Key Takeaway**: Start with ReLU + Adam optimizer for most tasks.
