package org.generation.ALMIUX.service;

import org.generation.ALMIUX.exceptions.ProductNotFoundException;
import org.generation.ALMIUX.model.Category;
import org.generation.ALMIUX.model.Product;
import org.generation.ALMIUX.repository.CategoryRepository;
import org.generation.ALMIUX.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Obtener todos los productos
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    // Obtener producto por ID
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    // Crear un nuevo producto
    @Transactional
    public Product createProduct(Product newProduct) {
        Long categoriaId = newProduct.getCategoria().getId();

        Category categoria = categoryRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("No existe la categoría con id: " + categoriaId));

        newProduct.setCategoria(categoria);

        if (newProduct.getActivo() == null) {
            newProduct.setActivo(true);
        }

        if (newProduct.getEnOferta() == null) {
            newProduct.setEnOferta(false);
        }

        if (newProduct.getDescuentoPct() == null) {
            newProduct.setDescuentoPct(0);
        }

        if (newProduct.getFechaCreacion() == null) {
            newProduct.setFechaCreacion(LocalDateTime.now());
        }

        BigDecimal precioFinal = calcularPrecioFinal(
                newProduct.getPrecio(),
                newProduct.getEnOferta(),
                newProduct.getDescuentoPct()
        );

        newProduct.setPrecioFinal(precioFinal);

        return productRepository.save(newProduct);
    }

    // Actualizar un producto existente por ID
    @Transactional
    public Product updateProduct(Long id, Product product) {
        Product existing = getProductById(id);

        Long categoriaId = product.getCategoria().getId();

        Category categoria = categoryRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("No existe la categoría con id: " + categoriaId));

        existing.setCategoria(categoria);
        existing.setNombre(product.getNombre());
        existing.setDescripcion(product.getDescripcion());
        existing.setIcono(product.getIcono());
        existing.setPrecio(product.getPrecio());

        if (product.getEnOferta() == null) {
            existing.setEnOferta(false);
        } else {
            existing.setEnOferta(product.getEnOferta());
        }

        if (product.getDescuentoPct() == null) {
            existing.setDescuentoPct(0);
        } else {
            existing.setDescuentoPct(product.getDescuentoPct());
        }

        if (product.getActivo() == null) {
            existing.setActivo(true);
        } else {
            existing.setActivo(product.getActivo());
        }

        BigDecimal precioFinal = calcularPrecioFinal(
                existing.getPrecio(),
                existing.getEnOferta(),
                existing.getDescuentoPct()
        );

        existing.setPrecioFinal(precioFinal);

        return productRepository.save(existing);
    }

    // Eliminar un producto por ID
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }

    private BigDecimal calcularPrecioFinal(BigDecimal precio, Boolean enOferta, Integer descuentoPct) {
        if (precio == null) {
            return null;
        }

        if (Boolean.TRUE.equals(enOferta) && descuentoPct != null && descuentoPct > 0) {
            BigDecimal descuento = BigDecimal.valueOf(descuentoPct)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            return precio.subtract(precio.multiply(descuento))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return precio.setScale(2, RoundingMode.HALF_UP);
    }
}