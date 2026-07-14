# Linear Algebra Foundations and Multidimensional Geometrical Representations

## 1. Introduction

Linear algebra is the foundational mathematical language of modern machine learning and artificial intelligence. From representation of inputs to deep transformations within neural architectures, nearly all operations in modern model pipelines are expressed through vector spaces, matrix equations, and spectral decompositions. 

### 1.1 History and Origins
The history of linear algebra is a journey from the solving of simultaneous linear equations to the abstract formulation of vector spaces. Early techniques for solving linear systems appeared in the ancient Chinese text *The Nine Chapters on the Mathematical Art* (around the 2nd century BCE), which introduced tabular methods akin to Gaussian elimination. However, the modern theory began to solidify in the 19th century. William Rowan Hamilton introduced quaternions in 1843, exploring hypercomplex numbers in multi-dimensional spaces. Hermann Grassmann published *Die lineale Ausdehnungslehre* (The Theory of Linear Extension) in 1844, establishing the foundation of multi-dimensional vector spaces and geometric algebra. The formal concept of a matrix was developed by Arthur Cayley in the 1850s, defining matrix addition, multiplication, and inversion.

### 1.2 Mathematical Motivations in Machine Learning
At its core, machine learning is the study of learning representations from data. A single data sample (such as a tabular row, an image, or a text embedding) is represented as a vector $\mathbf{x}$ in a high-dimensional vector space $\mathbb{R}^d$. A dataset of $m$ samples is naturally organized as a matrix $\mathbf{X} \in \mathbb{R}^{m \times d}$. 

Linear transformations allow us to map data from high-dimensional input spaces to lower-dimensional latent spaces, separating signal from noise. Neural network layers perform affine transformations:

$$\mathbf{y} = \mathbf{W}\mathbf{x} + \mathbf{b}$$

where the matrix $\mathbf{W}$ scales, rotates, and projects the input space, mapping representations to new manifolds where classes become linearly separable.

### 1.3 Real-World Relevance
In modern Retrieval-Augmented Generation (RAG) systems, dense text embeddings (e.g., vectors of dimension 768 or 1536) represent semantic meaning. Finding the most relevant document chunk for a user query requires calculating the Cosine Similarity in a high-dimensional inner product space:

$$\text{Sim}(\mathbf{u}, \mathbf{v}) = \frac{\langle\mathbf{u}, \mathbf{v}\rangle}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$

In computer vision, images are treated as multi-channel matrices, where convolutional kernels perform localized linear operations. Principal Component Analysis (PCA) and Singular Value Decomposition (SVD) are standard tools for dimensionality reduction, noise reduction, and collaborative filtering in recommendation algorithms.

---

## 2. Mathematical Foundations & Proofs

To build a rigorous understanding, we present the formal mathematical framework of linear spaces, linear mappings, and matrix factorizations.

### 2.1 Vector Spaces, Bases, and Gram-Schmidt Orthogonalization
Let $V$ be a set closed under vector addition and scalar multiplication over a field $F$ (typically $\mathbb{R}$). $V$ is a **vector space** if it satisfies the eight fundamental axioms (associativity, commutativity, identity elements, distributivity, etc.).

A set of vectors $\{\mathbf{v}_1, \mathbf{v}_2, \dots, \mathbf{v}_k\} \subset V$ is **linearly independent** if:

$$\sum_{i=1}^k c_i \mathbf{v}_i = \mathbf{0} \implies c_i = 0 \quad \forall i \in \{1, 2, \dots, k\}$$

A **basis** of $V$ is a linearly independent subset of $V$ that spans $V$. An **orthonormal basis** is a basis where all vectors are mutually orthogonal and have unit length:

$$\langle\mathbf{u}_i, \mathbf{u}_j\rangle = \delta_{ij} = \begin{cases} 1 & \text{if } i = j \\ 0 & \text{if } i \neq j \end{cases}$$

#### The Gram-Schmidt Process
Given a set of linearly independent vectors $\{\mathbf{v}_1, \dots, \mathbf{v}_k\}$, we construct an orthonormal basis $\{\mathbf{u}_1, \dots, \mathbf{u}_k\}$ spanning the same subspace.

1. First vector:
   $$\mathbf{u}_1 = \frac{\mathbf{w}_1}{\|\mathbf{w}_1\|_2}, \quad \text{where } \mathbf{w}_1 = \mathbf{v}_1$$
2. For $i = 2, \dots, k$, we project $\mathbf{v}_i$ onto the subspace spanned by $\{\mathbf{u}_1, \dots, \mathbf{u}_{i-1}\}$ and subtract this projection to obtain the orthogonal vector $\mathbf{w}_i$:
   $$\mathbf{w}_i = \mathbf{v}_i - \sum_{j=1}^{i-1} \text{proj}_{\mathbf{u}_j}(\mathbf{v}_i) = \mathbf{v}_i - \sum_{j=1}^{i-1} \langle\mathbf{v}_i, \mathbf{u}_j\rangle \mathbf{u}_j$$
   Normalize the result:
   $$\mathbf{u}_i = \frac{\mathbf{w}_i}{\|\mathbf{w}_i\|_2}$$

##### Proof of Orthogonality
We prove by induction that $\langle\mathbf{w}_i, \mathbf{u}_m\rangle = 0$ for all $m < i$.
Assume $\{\mathbf{u}_1, \dots, \mathbf{u}_{i-1}\}$ are mutually orthonormal. For any $m < i$:

$$\langle\mathbf{w}_i, \mathbf{u}_m\rangle = \left\langle \mathbf{v}_i - \sum_{j=1}^{i-1} \langle\mathbf{v}_i, \mathbf{u}_j\rangle \mathbf{u}_j, \mathbf{u}_m \right\rangle$$

Using the linearity of the inner product:

$$\langle\mathbf{w}_i, \mathbf{u}_m\rangle = \langle\mathbf{v}_i, \mathbf{u}_m\rangle - \sum_{j=1}^{i-1} \langle\mathbf{v}_i, \mathbf{u}_j\rangle \langle\mathbf{u}_j, \mathbf{u}_m\rangle$$

Since $\{\mathbf{u}_1, \dots, \mathbf{u}_{i-1}\}$ are orthonormal, $\langle\mathbf{u}_j, \mathbf{u}_m\rangle = \delta_{jm}$, which collapses the sum to a single term where $j = m$:

$$\langle\mathbf{w}_i, \mathbf{u}_m\rangle = \langle\mathbf{v}_i, \mathbf{u}_m\rangle - \langle\mathbf{v}_i, \mathbf{u}_m\rangle (1) = 0$$

Thus, $\mathbf{w}_i$ is orthogonal to all previously constructed basis vectors.

---

### 2.2 Matrix Transformations and the Rank-Nullity Theorem
A matrix $\mathbf{A} \in \mathbb{R}^{m \times n}$ represents a linear map $T: \mathbb{R}^n \to \mathbb{R}^m$.
* The **Kernel** (or Null Space) is the set of inputs mapped to the zero vector:
  $$\text{ker}(\mathbf{A}) = \{\mathbf{x} \in \mathbb{R}^n \mid \mathbf{A}\mathbf{x} = \mathbf{0}\}$$
* The **Image** (or Column Space/Range) is the set of all possible outputs:
  $$\text{im}(\mathbf{A}) = \{\mathbf{y} \in \mathbb{R}^m \mid \mathbf{y} = \mathbf{A}\mathbf{x} \text{ for some } \mathbf{x} \in \mathbb{R}^n\}$$

The dimension of $\text{im}(\mathbf{A})$ is the **Rank** of $\mathbf{A}$, denoted as $\text{rank}(\mathbf{A})$. The dimension of $\text{ker}(\mathbf{A})$ is the **Nullity** of $\mathbf{A}$, denoted as $\text{nullity}(\mathbf{A})$.

#### The Rank-Nullity Theorem
For any linear map represented by $\mathbf{A} \in \mathbb{R}^{m \times n}$:

$$\text{rank}(\mathbf{A}) + \text{nullity}(\mathbf{A}) = n$$

##### Mathematical Proof Outline
Let $\dim(\text{ker}(\mathbf{A})) = k$, and let $\{\mathbf{v}_1, \dots, \mathbf{v}_k\}$ be a basis for $\text{ker}(\mathbf{A})$. Extend this basis to a full basis of $\mathbb{R}^n$:
$$\{\mathbf{v}_1, \dots, \mathbf{v}_k, \mathbf{w}_1, \dots, \mathbf{w}_{n-k}\}$$
We want to show that $\{\mathbf{A}\mathbf{w}_1, \dots, \mathbf{A}\mathbf{w}_{n-k}\}$ forms a basis for $\text{im}(\mathbf{A})$.

1. **Spanning**: Any $\mathbf{y} \in \text{im}(\mathbf{A})$ can be written as $\mathbf{A}\mathbf{x}$ for some $\mathbf{x} \in \mathbb{R}^n$. Expressing $\mathbf{x}$ in terms of the basis:
   $$\mathbf{x} = \sum_{i=1}^k c_i \mathbf{v}_i + \sum_{j=1}^{n-k} d_j \mathbf{w}_j$$
   Applying $\mathbf{A}$:
   $$\mathbf{A}\mathbf{x} = \sum_{i=1}^k c_i \mathbf{A}\mathbf{v}_i + \sum_{j=1}^{n-k} d_j \mathbf{A}\mathbf{w}_j = \mathbf{0} + \sum_{j=1}^{n-k} d_j \mathbf{A}\mathbf{w}_j$$
   Since $\mathbf{v}_i \in \text{ker}(\mathbf{A})$, the first sum vanishes. Thus, $\{\mathbf{A}\mathbf{w}_j\}$ spans $\text{im}(\mathbf{A})$.

2. **Linear Independence**: Assume:
   $$\sum_{j=1}^{n-k} d_j \mathbf{A}\mathbf{w}_j = \mathbf{0} \implies \mathbf{A}\left(\sum_{j=1}^{n-k} d_j \mathbf{w}_j\right) = \mathbf{0}$$
   This implies that $\sum_{j=1}^{n-k} d_j \mathbf{w}_j$ is in $\text{ker}(\mathbf{A})$. Therefore, it can be written as a linear combination of the kernel's basis vectors:
   $$\sum_{j=1}^{n-k} d_j \mathbf{w}_j = \sum_{i=1}^k c_i \mathbf{v}_i \implies \sum_{j=1}^{n-k} d_j \mathbf{w}_j - \sum_{i=1}^k c_i \mathbf{v}_i = \mathbf{0}$$
   Since the full set of vectors is a basis for $\mathbb{R}^n$, they are linearly independent, forcing all coefficients $d_j$ and $c_i$ to be $0$.
   Hence, $\{\mathbf{A}\mathbf{w}_1, \dots, \mathbf{A}\mathbf{w}_{n-k}\}$ is linearly independent and spans $\text{im}(\mathbf{A})$.
   Thus, $\dim(\text{im}(\mathbf{A})) = n - k$, which proves $\text{rank}(\mathbf{A}) + \text{nullity}(\mathbf{A}) = n$.

---

### 2.3 Spectral Theory: Eigenvalues, Eigenvectors, and Spectral Decomposition
For a square matrix $\mathbf{A} \in \mathbb{R}^{n \times n}$, a non-zero vector $\mathbf{v}$ and scalar $\lambda$ are an **eigenvector-eigenvalue pair** if:

$$\mathbf{A}\mathbf{v} = \lambda \mathbf{v}$$

Solving this requires finding the roots of the characteristic equation:

$$\det(\mathbf{A} - \lambda \mathbf{I}) = 0$$

#### Spectral Theorem for Symmetric Matrices
If $\mathbf{A} \in \mathbb{R}^{n \times n}$ is symmetric ($\mathbf{A} = \mathbf{A}^T$), all its eigenvalues are real, and eigenvectors corresponding to distinct eigenvalues are orthogonal. Furthermore, $\mathbf{A}$ can be orthogonally diagonalized:

$$\mathbf{A} = \mathbf{Q} \mathbf{\Lambda} \mathbf{Q}^T = \sum_{i=1}^n \lambda_i \mathbf{q}_i \mathbf{q}_i^T$$

where $\mathbf{Q}$ is an orthogonal matrix ($\mathbf{Q}^T\mathbf{Q} = \mathbf{I}$) containing the orthonormal eigenvectors $\mathbf{q}_i$ as columns, and $\mathbf{\Lambda}$ is a diagonal matrix containing the eigenvalues $\lambda_i$.

##### Proof of Orthogonality of Eigenvectors
Let $\mathbf{A}\mathbf{v}_1 = \lambda_1 \mathbf{v}_1$ and $\mathbf{A}\mathbf{v}_2 = \lambda_2 \mathbf{v}_2$ with $\lambda_1 \neq \lambda_2$. Consider:

$$\lambda_1 \langle\mathbf{v}_1, \mathbf{v}_2\rangle = \langle\lambda_1 \mathbf{v}_1, \mathbf{v}_2\rangle = \langle\mathbf{A}\mathbf{v}_1, \mathbf{v}_2\rangle = (\mathbf{A}\mathbf{v}_1)^T \mathbf{v}_2 = \mathbf{v}_1^T \mathbf{A}^T \mathbf{v}_2$$

Since $\mathbf{A} = \mathbf{A}^T$:

$$\mathbf{v}_1^T \mathbf{A}^T \mathbf{v}_2 = \mathbf{v}_1^T \mathbf{A} \mathbf{v}_2 = \mathbf{v}_1^T (\lambda_2 \mathbf{v}_2) = \lambda_2 \langle\mathbf{v}_1, \mathbf{v}_2\rangle$$

Thus:

$$(\lambda_1 - \lambda_2) \langle\mathbf{v}_1, \mathbf{v}_2\rangle = 0$$

Since $\lambda_1 \neq \lambda_2$, we must have $\langle\mathbf{v}_1, \mathbf{v}_2\rangle = 0$.

---

### 2.4 Singular Value Decomposition (SVD)
The SVD generalizes spectral decomposition to any matrix $\mathbf{A} \in \mathbb{R}^{m \times n}$.

$$\mathbf{A} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$$

where:
* $\mathbf{U} \in \mathbb{R}^{m \times m}$ is an orthogonal matrix of **left-singular vectors** (eigenvectors of $\mathbf{A}\mathbf{A}^T$).
* $\mathbf{V} \in \mathbb{R}^{n \times n}$ is an orthogonal matrix of **right-singular vectors** (eigenvectors of $\mathbf{A}^T\mathbf{A}$).
* $\mathbf{\Sigma} \in \mathbb{R}^{m \times n}$ is a diagonal matrix with non-negative **singular values** $\sigma_i = \sqrt{\lambda_i}$, sorted in descending order: $\sigma_1 \geq \sigma_2 \geq \dots \geq \sigma_{\min(m,n)} \geq 0$.

```
           A                =         U          x       Sigma       x        V^T
     [ . . . . . ]                 [ . . . ]          [ \s1       ]      [ . . . . . ]
     [ . . . . . ]   (m x n)       [ . . . ] (m x m)  [    \s2    ]      [ . . . . . ] (n x n)
     [ . . . . . ]                 [ . . . ]          [       \0  ]      [ . . . . . ]
                                                      (m x n)
```

#### Low-Rank Approximation and Eckart-Young-Mirsky Theorem
In machine learning, we often want to compress data or eliminate noise by finding a low-rank matrix $\mathbf{A}_k$ (of rank $k < \text{rank}(\mathbf{A})$) that is closest to $\mathbf{A}$.
The SVD provides this via truncation:

$$\mathbf{A}_k = \sum_{i=1}^k \sigma_i \mathbf{u}_i \mathbf{v}_i^T$$

The **Eckart-Young-Mirsky Theorem** states that under the Frobenius norm, $\mathbf{A}_k$ is the optimal rank-$k$ approximation:

$$\min_{\text{rank}(\mathbf{B}) \leq k} \|\mathbf{A} - \mathbf{B}\|_F = \|\mathbf{A} - \mathbf{A}_k\|_F = \sqrt{\sum_{i=k+1}^{\min(m,n)} \sigma_i^2}$$

---

## 3. Geometrical and Computational Interpretations

Linear transformations represent coordinate deformations. A matrix multiplication stretches, shears, and rotates the unit hypersphere.

```
       Unit Circle                         Sheared & Stretched Ellipse
          y                                         y
          ^                                         ^
       *  |  *                                      |     *---*
     *    |    *   =======> Linear Map A ========>  |   /      \ 
    *-----+-----> x                                 +-------------> x
     *    |    *                                     \        /
       *  |  *                                         *----*
```

* **Determinant**: The determinant $\det(\mathbf{A})$ represents the volume scaling factor of the transformation. If $\det(\mathbf{A}) = 0$, the transformation collapses the space into a lower dimension, mapping a volume to a flat surface or line (representing loss of information, corresponding to non-invertibility).
* **Eigenvalues**: Eigenvectors define the invariant directions of the mapping where no rotation occurs—only scaling by factor $\lambda$.
* **SVD Geometry**: SVD breaks any linear mapping into three sequential steps:
  1. A rotation in the input space ($\mathbf{V}^T$).
  2. A scaling along the coordinate axes ($\mathbf{\Sigma}$).
  3. A final rotation in the output space ($\mathbf{U}$).

---

## 4. Algorithmic Implementation from Scratch

Below is a complete, production-ready Python class implementing the Gram-Schmidt Orthogonalization process and finding the dominant eigenvector using the Power Iteration method.

```python
# -*- coding: utf-8 -*-
import numpy as np

class LinearAlgebraToolkit:
    """
    A collection of fundamental linear algebra algorithms implemented from scratch
    using only basic NumPy features. Designed for educational transparency.
    """
    
    @staticmethod
    def gram_schmidt(vectors: np.ndarray) -> np.ndarray:
        """
        Computes the orthonormal basis of a set of vectors using the Gram-Schmidt process.
        
        Parameters:
        -----------
        vectors : np.ndarray
            A 2D array of shape (k, n) where each row represents a vector.
            
        Returns:
        --------
        np.ndarray
            A 2D array of shape (k, n) representing the orthonormal basis vectors.
        """
        vectors = np.array(vectors, dtype=np.float64)
        k, n = vectors.shape
        ortho_basis = np.zeros((k, n))
        
        for i in range(k):
            # Start with the original vector
            w = vectors[i].copy()
            
            # Subtract projections onto all previously computed basis vectors
            for j in range(i):
                u_j = ortho_basis[j]
                projection_scalar = np.dot(vectors[i], u_j)
                w -= projection_scalar * u_j
                
            # Compute L2 norm of the orthogonal vector
            norm = np.linalg.norm(w)
            
            # Avoid division by zero for linearly dependent input vectors
            if norm < 1e-12:
                raise ValueError(
                    f"Vector at index {i} is linearly dependent on prior vectors."
                )
                
            # Normalize to get the orthonormal vector
            ortho_basis[i] = w / norm
            
        return ortho_basis

    @staticmethod
    def power_iteration(A: np.ndarray, num_iterations: int = 1000, tol: float = 1e-9) -> tuple:
        """
        Finds the dominant eigenvalue and its corresponding eigenvector of a square matrix
        using the Power Iteration algorithm.
        
        Parameters:
        -----------
        A : np.ndarray
            A square 2D matrix of shape (n, n).
        num_iterations : int
            Maximum number of iterations.
        tol : float
            Tolerance for early convergence check based on eigenvector change.
            
        Returns:
        --------
        eigenvalue : float
            The dominant eigenvalue.
        eigenvector : np.ndarray
            The normalized dominant eigenvector of shape (n,).
        """
        A = np.array(A, dtype=np.float64)
        n = A.shape[0]
        assert A.shape == (n, n), "Input matrix A must be square."
        
        # Initialize a random vector
        b_k = np.random.rand(n)
        b_k = b_k / np.linalg.norm(b_k)
        
        eigenvalue_old = 0.0
        
        for iteration in range(num_iterations):
            # Compute the matrix-vector product
            b_k1 = np.dot(A, b_k)
            
            # Compute L2 norm of the new vector
            norm = np.linalg.norm(b_k1)
            if norm < 1e-12:
                # The dominant eigenvalue is 0
                return 0.0, b_k
                
            # Normalize the vector
            b_k1 = b_k1 / norm
            
            # Rayleigh quotient to estimate eigenvalue: lambda = (b^T A b) / (b^T b)
            # Since b_k1 is normalized, b^T b = 1
            eigenvalue = np.dot(b_k1, np.dot(A, b_k1))
            
            # Check for convergence
            if np.abs(eigenvalue - eigenvalue_old) < tol:
                break
                
            b_k = b_k1
            eigenvalue_old = eigenvalue
            
        return eigenvalue, b_k

# Example validation execution
if __name__ == "__main__":
    # Test Gram-Schmidt
    v = np.array([[3.0, 1.0], [2.0, 2.0]])
    toolkit = LinearAlgebraToolkit()
    ortho = toolkit.gram_schmidt(v)
    print("Orthonormal Basis:\n", ortho)
    print("Verification of Orthogonality (dot product):", np.dot(ortho[0], ortho[1]))
    
    # Test Power Iteration
    A = np.array([[2.0, 1.0], [1.0, 3.0]])
    val, vec = toolkit.power_iteration(A)
    print(f"\nDominant Eigenvalue: {val:.6f}")
    print(f"Dominant Eigenvector: {vec}")
    
    # Compare with NumPy library solver
    np_vals, np_vecs = np.linalg.eig(A)
    idx = np.argmax(np.abs(np_vals))
    print(f"NumPy Dominant Eigenvalue: {np_vals[idx]:.6f}")
    print(f"NumPy Dominant Eigenvector: {np_vecs[:, idx]}")
```

---

## 5. Engineering Challenges & Optimization Techniques

Implementing linear algebra operations at scale introduces critical numerical and physical computational challenges.

### 5.1 Numerical Instability and Floating-Point Representation
Computer processors represent real numbers using floating-point formats (e.g., IEEE 754 float32 or float64). This discrete representation has finite precision, leading to rounding errors.
* **Underflow and Overflow**: Multiplying many small matrix probabilities can lead to values underflowing to $0.0$. Conversely, exponential scaling can cause overflow to $\infty$. To resolve underflow in likelihood computation, we calculate in the log-space (e.g., Log-Sum-Exp trick).
* **Ill-Conditioned Systems**: Solving $\mathbf{A}\mathbf{x} = \mathbf{b}$ becomes numerically unstable if $\mathbf{A}$ has a high **condition number** $\kappa(\mathbf{A})$:
  $$\kappa(\mathbf{A}) = \frac{\sigma_{\max}(\mathbf{A})}{\sigma_{\min}(\mathbf{A})}$$
  If $\sigma_{\min} \approx 0$, computing $\mathbf{A}^{-1}$ magnifies numerical precision errors, rendering the results useless. In such cases, pseudo-inversion (Moore-Penrose Inverse via SVD truncation) or regularization (adding a small factor to the diagonal, $\mathbf{A} + \lambda \mathbf{I}$) is necessary.

### 5.2 Algorithmic Speed and Hardware Optimization
Naive matrix multiplication ($\mathbf{C} = \mathbf{A}\mathbf{B}$) takes $O(n^3)$ operations. 
* **Strassen's Algorithm**: Reduces complexity to $O(n^{2.807})$ by block partitioning, though it introduces some numerical instability.
* **Cache Locality**: CPU architectures rely heavily on cache hierarchy (L1, L2, L3 caches). Accessing column-major indices in row-major arrays causes cache misses. Modern BLAS (Basic Linear Algebra Subprograms) libraries mitigate this using **loop tiling/blocking** and vectorization instructions (AVX-512, SIMD).
* **GPU Parallelism**: Matrix multiplications are highly parallelizable. Modern deep learning exploits GPUs containing thousands of arithmetic units, executing massive parallel tile updates on specialized hardware tensors.

---

## 6. Conclusion & Summary

Linear algebra forms the structural skeleton of machine learning models. Data samples are vectors residing in high-dimensional linear spaces, and transformations are matrices acting upon those spaces. The Gram-Schmidt process demonstrates how we construct orthogonal frames for structured analysis, while spectral decomposition (EVD) and singular value decomposition (SVD) provide low-rank approximations to reduce complexity. Implementing these algorithms requires balancing theoretical mathematical models with the engineering constraints of finite precision arithmetic and cache-efficient hardware architectures.
