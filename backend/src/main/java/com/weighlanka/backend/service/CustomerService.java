package com.weighlanka.backend.service;

import com.weighlanka.backend.model.Customer;
import com.weighlanka.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // CREATE
    public Customer addCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    // GET ALL
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // GET BY ID (full version)
    public Customer getCustomerById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    // SHORT VERSION used by scheduler
    public Customer getCustomer(String id) {
        return customerRepository.findById(id).orElse(null);
    }

    // UPDATE
    public Customer updateCustomer(String id, Customer updatedCustomer) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        existing.setCustomerName(updatedCustomer.getCustomerName());
        existing.setAddress(updatedCustomer.getAddress());
        existing.setPhone(updatedCustomer.getPhone());
        existing.setEmail(updatedCustomer.getEmail());

        return customerRepository.save(existing);
    }

    // DELETE
    public String deleteCustomer(String id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found");
        }
        customerRepository.deleteById(id);
        return "Customer deleted successfully!";
    }
}
