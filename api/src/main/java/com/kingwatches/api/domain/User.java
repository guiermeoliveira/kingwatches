package com.kingwatches.api.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;

public class User {

    @Entity
    @Table(name = "usuarios")
    public class Usuario {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, length = 120)
        private String nome;

        @Column(unique = true, nullable = false, length = 160)
        private String email;

        @Column(nullable = false)
        private String senhaHash;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role = Role.CLIENTE;

        // Preparação estrutural para futuro KYC (Know Your Customer)
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private KycStatus kycStatus = KycStatus.NAO_VERIFICADO;

        @Column(updatable = false)
        private LocalDateTime criadoEm = LocalDateTime.now();

        public enum Role { CLIENTE, ADMIN }
        public enum KycStatus { NAO_VERIFICADO, PENDENTE, APROVADO, REJEITADO }

        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenhaHash() { return senhaHash; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public KycStatus getKycStatus() { return kycStatus; }
        public void setKycStatus(KycStatus kycStatus) { this.kycStatus = kycStatus; }
        public LocalDateTime getCriadoEm() { return criadoEm; }
    }
}
